import {
  Body,
  Controller,
  Delete,
  Get,
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
