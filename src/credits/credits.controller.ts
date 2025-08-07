import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreateCreditDto, PaginationDto, SearchCreditDto } from './dto/create-credit.dto';
import { UsersService } from 'src/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as csv from 'csv-parser';
import * as fs from 'fs';

@Controller('credits')
export class CreditsController {
  constructor(
    private readonly creditService: CreditsService,
    private readonly userService: UsersService,
    ) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCreditDto) {
    const user = await this.userService.findByCurp(createCompanyDto.clientCurp);
    return this.creditService.create(createCompanyDto, user);
  }

  @Get('search')
async search(@Query() searchParams: SearchCreditDto) {
  return this.creditService.searchCredits(searchParams);
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
      .on('end', () => {
        // Do something with the processed data
        for (const row of results) {
          // Do something with the row
          const v = new CreateCreditDto();
          v.credit_amount = Number.parseFloat(row.credit_amount);
          v.hitch_amount = row.hitch_amount;
          v.branch_phone = row.branch_phone;
          v.model_phone = row.model_phone;
          v.pending_payments = Number.parseInt(row.pending_payments);
          v.current_balance = Number.parseFloat(row.current_balance);
          v.imei = row.imei;
          v.weekly_payment = row.weekly_payment;
          v.weekly_day_payment = row.weekly_day_payment;
          v.clientCurp = row.clientCurp;
          this.create(v);
        }
        // Remove the uploaded file after processing
        fs.unlinkSync(file.path);
      })
      .on('error', (error) => {
        // Handle error
        console.error(error,'ERROR CREDITS');
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

    const results: any[] = [];
    const errors: Array<{ row: number; error: string; data: any }> = [];
    let processedRows = 0;

    try {
      await new Promise<void>((resolve, reject) => {
        let headersValidated = false;
        fs.createReadStream(file.path)
          .pipe(csv())
          .on('headers', (headers) => {
            const expected = [
              'credit_amount',
              'hitch_amount',
              'branch_phone',
              'model_phone',
              'pending_payments',
              'current_balance',
              'imei',
              'weekly_payment',
              'weekly_day_payment',
              'clientCurp',
            ];
            const missing = expected.filter((h) => !headers.includes(h));
            if (missing.length) {
              return reject(
                new Error(
                  `Faltan columnas obligatorias: ${missing.join(', ')}`,
                ),
              );
            }
            headersValidated = true;
          })
          .on('data', async (row) => {
            processedRows++;
            const rowNumber = processedRows + 1; // cuenta encabezado
            try {
              // Validaciones mínimas
              if (
                !row.credit_amount ||
                !row.clientCurp ||
                isNaN(Number.parseFloat(row.credit_amount))
              ) {
                throw new Error('credit_amount inválido o clientCurp faltante');
              }

              const dto = this.mapRowToDto(row);
              const created = await this.create(dto);
              results.push(created);
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
      console.error('Error procesando CSV créditos:', err.message);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error procesando archivo CSV de créditos',
          details: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      // Eliminar archivo temporal
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    return {
      success: results.length,
      errors: errors.length,
      details: {
        processed: processedRows,
        successful: results.length,
        failed: errors.length,
        errors: errors.slice(0, 10),
      },
      message: this.generateSummaryMessage(results.length, errors.length),
    };
  }

  private mapRowToDto(row: any): CreateCreditDto {
    const dto = new CreateCreditDto();
    dto.credit_amount        = Number.parseFloat(row.credit_amount);
    dto.hitch_amount         = row.hitch_amount;
    dto.branch_phone         = row.branch_phone;
    dto.model_phone          = row.model_phone;
    dto.pending_payments     = Number.parseInt(row.pending_payments, 10);
    dto.current_balance      = Number.parseFloat(row.current_balance);
    dto.imei                 = row.imei;
    dto.weekly_payment       = row.weekly_payment;
    dto.weekly_day_payment   = row.weekly_day_payment;
    dto.clientCurp           = row.clientCurp;
    return dto;
  }

  private generateSummaryMessage(success: number, errors: number): string {
    if (errors === 0) return 'Todos los créditos fueron procesados exitosamente';
    if (success === 0) return 'No se pudo procesar ningún crédito';
    return `Procesados ${success} créditos con ${errors} errores`;
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.creditService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditService.findOne(+id);
  }

  @Get('imei/:id')
  findOneByImei(@Param('id') id: string) {
    return this.creditService.findOneByImei(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: CreateCreditDto) {
    return this.creditService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditService.remove(+id);
  }
}
