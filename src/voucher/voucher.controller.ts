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
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto, PaginationParamsDto } from './dto/create-voucher.dto';
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
