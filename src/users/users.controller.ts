import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, PaginationDto } from './dto/createUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as csv from 'csv-parser';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  create(@Body() createuserDto: CreateUserDto) {
    return this.userService.create(createuserDto);
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
          const user = new CreateUserDto();
          user.firstName = row.firstName;
          user.lastName = row.lastName;
          user.secondName = row.secondName;
          user.clientEmail = row.clientEmail;
          user.clientPhoneNumber = row.clientPhoneNumber;
          user.clientCurp = row.clientCurp;
          this.create(user);
          console.log(row.clientCurp);
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

    const results: CreateUserDto[] = [];
    const errors: Array<{ row: number; error: string; data: any }> = [];
    let processedRows = 0;

    try {
      await new Promise<void>((resolve, reject) => {
        let headersValidated = false;
        fs.createReadStream(file.path)
          .pipe(csv())
          .on('headers', (headers) => {
            const expected = [
              'firstName',
              'lastName',
              'secondName',
              'clientEmail',
              'clientPhoneNumber',
              'clientCurp',
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
            const rowNumber = processedRows + 1; // cuenta encabezado
            try {
              // Validaciones
              if (!row.firstName || !row.lastName || !row.clientEmail) {
                throw new Error('Campos requeridos faltantes');
              }

              const dto = this.mapRowToDto(row);
              const created = await this.userService.create(dto);
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
      console.error('Error procesando CSV:', err.message);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error procesando archivo CSV',
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

  private mapRowToDto(row: any): CreateUserDto {
    const dto = new CreateUserDto();
    dto.firstName = row.firstName.trim();
    dto.lastName = row.lastName.trim();
    dto.secondName = row.secondName?.trim();
    dto.clientEmail = row.clientEmail.trim();
    dto.clientPhoneNumber = row.clientPhoneNumber.trim();
    dto.clientCurp = row.clientCurp.trim();
    return dto;
  }

  private generateSummaryMessage(success: number, errors: number): string {
    if (errors === 0) return 'Todos los registros fueron procesados exitosamente';
    if (success === 0) return 'No se pudo procesar ningún registro';
    return `Procesados ${success} registros con ${errors} errores`;
  }

  @Get('complete/search')
  find(
    @Query('phone') phone: string,
    @Query('email') email: string,
    @Query('curp') curp: string,
  ) {
    return this.userService.findSearch(phone, email, curp);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  /*
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateuserDto: CreateuserDto) {
      return this.userService.update(+id, updateuserDto);
    }*/

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
