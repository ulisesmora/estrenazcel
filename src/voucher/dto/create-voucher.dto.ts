import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsString()
  payment_date: string;
  @IsNotEmpty()
  @IsString()
  code: string;
  @IsOptional()
  codeLated: string;
  @IsNotEmpty()
  @IsNumber()
  amount: number;
  @IsOptional()
  amountRetarded: number;
  @IsNotEmpty()
  @IsString()
  creditId: string; 
  @IsNotEmpty()
  @IsNumber()
  companyId: number;
}
