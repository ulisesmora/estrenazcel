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
import {
  CreateCreditDto,
  PaginationDto,
  SearchCreditDto,
} from './dto/create-credit.dto';
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
        console.error(error, 'ERROR CREDITS');
      });
    // Return response
  }

  @Post('upload-csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
      fileFilter: (_, file, cb) => {
        const isCsv = file.originalname.toLowerCase().endsWith('.csv');
        if (!isCsv)
          return cb(
            new BadRequestException('Solo se permiten archivos CSV'),
            false,
          );
        cb(null, true);
      },
    }),
  )
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se proporcionó archivo');

    const stats = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    try {
      // 1. Validar cabeceras primero (Stream rápido)
      await this.validateCsvHeaders(file.path);

      // 2. Procesar datos (Stream asíncrono fila por fila)
      const stream = fs.createReadStream(file.path).pipe(csv());

      for await (const row of stream) {
        stats.total++;
        try {
          // Limpiamos y mapeamos los datos
          const dto = this.mapRowToDto(row);

          // Validación mínima de negocio
          if (!dto.clientCurp)
            throw new Error('El campo clientCurp es obligatorio');

          // Intentamos guardar en DB
          await this.create(dto);
          stats.success++;
        } catch (err) {
          // Si falla una fila, NO se detiene el proceso. Registramos y seguimos.
          stats.failed++;
          stats.errors.push({
            fila: stats.total + 1, // +1 por el header
            error: err.message,
            identificador: row.clientCurp || 'Sin CURP',
            dataOriginal: row,
          });
        }
      }
    } catch (err) {
      throw new HttpException(
        { error: 'Error crítico procesando CSV', details: err.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    return {
      message: this.generateSummaryMessage(stats.success, stats.failed),
      stats: {
        procesados: stats.total,
        exitosos: stats.success,
        fallidos: stats.failed,
      },
      // Solo devolvemos los primeros 20 errores para no saturar la respuesta
      errores: stats.errors.slice(0, 20),
    };
  }

  // --- MÉTODOS DE APOYO ---

  /**
   * Limpia strings con $, comas o espacios y devuelve un número válido
   */
  private cleanNumeric(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    // Elimina todo lo que no sea número, punto o signo menos
    const cleanValue = String(value).replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  private mapRowToDto(row: any): CreateCreditDto {
    const dto = new CreateCreditDto();
    // Aplicamos cleanNumeric a todos los campos que deben ser números
    dto.credit_amount = this.cleanNumeric(row.credit_amount);
    dto.current_balance = this.cleanNumeric(row.current_balance);
    dto.hitch_amount = row.hitch_amount; // Si este también es número, usa cleanNumeric

    dto.branch_phone = String(row.branch_phone || '').trim();
    dto.model_phone = String(row.model_phone || '').trim();
    dto.pending_payments =
      parseInt(String(row.pending_payments).replace(/[^0-9]+/g, ''), 10) || 0;
    dto.imei = String(row.imei || '').trim();
    dto.weekly_payment = row.weekly_payment;
    dto.weekly_day_payment = row.weekly_day_payment;
    dto.clientCurp = String(row.clientCurp || '').trim();

    return dto;
  }

  private async validateCsvHeaders(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath).pipe(csv());
      stream.on('headers', (headers) => {
        const expected = ['credit_amount', 'clientCurp']; // Solo las críticas
        const missing = expected.filter((h) => !headers.includes(h));
        stream.destroy(); // Cerramos el stream tras validar headers
        if (missing.length) {
          reject(
            new Error(
              `Formato inválido. Faltan columnas: ${missing.join(', ')}`,
            ),
          );
        }
        resolve();
      });
      stream.on('error', (err) => reject(err));
    });
  }

  private generateSummaryMessage(success: number, errors: number): string {
    if (errors === 0)
      return 'Todos los créditos fueron procesados exitosamente';
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

  @Get('sucursal/sucursal')
  findSucursals() {
    return this.creditService.findDistinctSucursalNames();
  }

  @Get('sucursal/:sucursal')
  findCreditsInSucursals(@Param('sucursal') sucursal: string) {
    return this.creditService.findCreditsBySucursal(sucursal);
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
