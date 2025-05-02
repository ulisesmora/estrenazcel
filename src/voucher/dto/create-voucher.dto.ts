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

export class PaginationParamsDto {
  page?: number = 1;
  limit?: number = 10;
  sortBy?: string = 'id';
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
  // Puedes añadir más filtros si necesitas
}
