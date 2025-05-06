import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto, PaginationParamsDto, SearchVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CreditsService } from 'src/credits/credits.service';
import { CompanyService } from 'src/company/company.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as csv from 'csv-parser';
import * as fs from 'fs';

@Controller('voucher')
export class VoucherController {
  constructor(
    private readonly voucherService: VoucherService,
    private readonly creditService: CreditsService,
    private readonly companyService: CompanyService,
  ) {}

  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    const credit = await this.creditService.findOneByImei(
      createVoucherDto.creditId,
    );
    const company = await this.companyService.findOne(
      createVoucherDto.companyId,
    );
    return this.voucherService.create(createVoucherDto, credit, company);
  }

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    const results = [];
    // Read uploaded CSV file and process each row
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data) => {
        // Process each row here
        results.push(data);
      })
      .on('end',  () => {
        // Do something with the processed data
        for (const row of results) {
          // Do something with the row
          const v = new CreateVoucherDto();
          v.payment_date = row.payment_date;
          v.code = row.code;
          v.codeLated = row.codeLated;
          v.amount = Number.parseFloat(row.amount);
          v.amountRetarded = (row.amountRetarded) ? Number.parseFloat(row.amountRetarded) : null ;
          v.creditId = row.creditId;
          v.companyId = Number.parseInt(row.companyId);
          if( v.amount && v.creditId ){
          this.create(v);
          }
          console.log(row.amount, row.creditId )
        }
        // Remove the uploaded file after processing
        fs.unlinkSync(file.path);
      })
      .on('error', (error) => {
        // Handle error
        console.error(error);
      });
    // Return response
  }

  @Post('upload-csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => cb(null, file.originalname),
      }),
      fileFilter: (_, file, cb) => {
        const isCsv = file.originalname.toLowerCase().endsWith('.csv');
        if (!isCsv) {
          return cb(new BadRequestException('Solo se permiten archivos CSV'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo');
    }

    const createdVouchers: any[] = [];
    const errors: Array<{ row: number; error: string; data: any }> = [];
    let processedRows = 0;

    try {
      await new Promise<void>((resolve, reject) => {
        let headersValidated = false;
        fs.createReadStream(file.path)
          .pipe(csv())
          .on('headers', (headers) => {
            const expected = [
              'payment_date',
              'code',
              'codeLated',
              'amount',
              'amountRetarded',
              'creditId',
              'companyId',
            ];
            const missing = expected.filter((h) => !headers.includes(h));
            if (missing.length) {
              return reject(
                new Error(`Faltan columnas obligatorias: ${missing.join(', ')}`),
              );
            }
            headersValidated = true;
          })
          .on('data', async (row) => {
            processedRows++;
            const rowNumber = processedRows + 1; // incluye encabezado
            try {
              // Validaciones básicas
              if (!row.payment_date || !row.code || !row.creditId) {
                throw new Error('payment_date, code o creditId faltantes');
              }
              const amount = Number.parseFloat(row.amount);
              if (isNaN(amount)) {
                throw new Error('amount inválido');
              }
              const companyId = Number.parseInt(row.companyId, 10);
              if (isNaN(companyId)) {
                throw new Error('companyId inválido');
              }

              const dto = this.mapRowToDto(row);
              const created = await this.create(dto);
              createdVouchers.push(created);
            } catch (err) {
              errors.push({
                row: rowNumber,
                error: err.message,
                data: row,
              });
            }
          })
          .on('end', () => {
            if (!headersValidated) {
              return reject(new Error('No se pudieron validar los encabezados'));
            }
            resolve();
          })
          .on('error', (err) => reject(err));
      });
    } catch (err) {
      console.error('Error procesando CSV vouchers:', err.message);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error procesando archivo CSV de vouchers',
          details: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    return {
      success: createdVouchers.length,
      errors: errors.length,
      details: {
        processed: processedRows,
        successful: createdVouchers.length,
        failed: errors.length,
        errors: errors.slice(0, 10),
      },
      message: this.generateSummaryMessage(createdVouchers.length, errors.length),
    };
  }

  private mapRowToDto(row: any): CreateVoucherDto {
    const dto = new CreateVoucherDto();
    dto.payment_date     = row.payment_date;
    dto.code             = row.code;
    dto.codeLated        = row.codeLated;
    dto.amount           = Number.parseFloat(row.amount);
    dto.amountRetarded   = row.amountRetarded
      ? Number.parseFloat(row.amountRetarded)
      : null;
    dto.creditId         = row.creditId;
    dto.companyId        = Number.parseInt(row.companyId, 10);
    return dto;
  }

  private generateSummaryMessage(success: number, errors: number): string {
    if (errors === 0) return 'Todos los vouchers fueron procesados exitosamente';
    if (success === 0) return 'No se pudo procesar ningún voucher';
    return `Procesados ${success} vouchers con ${errors} errores`;
  }


  @Get('search')
  async search(@Query() searchParams: SearchVoucherDto) {
    return this.voucherService.searchCredits(searchParams);
  }


  @Get()
  async findAll(@Query() paginationParams: PaginationParamsDto) {
    return this.voucherService.findAll(paginationParams);
  }



  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voucherService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVoucherDto: CreateVoucherDto) {
    return this.voucherService.update(+id, updateVoucherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.voucherService.remove(+id);
  }
}
