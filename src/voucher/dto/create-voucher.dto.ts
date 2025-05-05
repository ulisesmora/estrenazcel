import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

export interface PaginatedResultDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    last_page: number;
  };
}

export class SearchVoucherDto {
  // Paginación
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  // Ordenamiento
  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  // Campos principales del voucher
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  codeLated?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  amountRetarded?: number;

  // Campos anidados de Credit (usar notación punto)
  @IsOptional()
  @IsNumber()
  'credit.id'?: number;

  @IsOptional()
  @IsNumber()
  'credit.credit_amount'?: number;

  @IsOptional()
  @IsNumber()
  'credit.hitch_amount'?: number;

  @IsOptional()
  @IsString()
  'credit.branch_phone'?: string;

  @IsOptional()
  @IsString()
  'credit.model_phone'?: string;

  @IsOptional()
  @IsNumber()
  'credit.pending_payments'?: number;

  @IsOptional()
  @IsNumber()
  'credit.current_balance'?: number;

  @IsOptional()
  @IsString()
  'credit.imei'?: string;

  // Campos anidados de Company
  @IsOptional()
  @IsNumber()
  'company.id'?: number;

  @IsOptional()
  @IsString()
  'company.name'?: string;

  // ... Agrega aquí otros campos que necesites buscar
}