import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreateCreditDto } from './dto/create-credit.dto';
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
          v.credit_amount = row.credit_amount;
          v.hitch_amount = row.hitch_amount;
          v.branch_phone = row.branch_phone;
          v.model_phone = row.model_phone;
          v.pending_payments = row.pending_payments;
          v.current_balance = row.current_balance;
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

  @Get()
  findAll() {
    return this.creditService.findAll();
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
