import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsString()
  payment_date: string;
  @IsNotEmpty()
  @IsString()
  code: string;
  @IsNotEmpty()
  @IsNumber()
  amount: number;
  @IsNotEmpty()
  @IsNumber()
  amountRetarded: number;
  @IsNotEmpty()
  @IsNumber()
  creditId: number;  
  @IsNotEmpty()
  @IsNumber()
  companyId: number;
}
