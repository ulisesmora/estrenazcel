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
 
  id?: number;
  payment_date?: string;
  code?: string;
  codeLated?: string;
  'credit.id'?: number;
  'credit.credit_amount'?: number;
  'credit.hitch_amount'?: number;
  'credit.branch_phone'?: string;
  'credit.model_phone'?: string;
  'credit.pending_payments'?: number;
  'credit.current_balance'?: number;
  'credit.imei'?: string;
  'company.id'?: number;
  'company.name'?: string;
  page?: number = 1;
  limit?: number = 10;
}
