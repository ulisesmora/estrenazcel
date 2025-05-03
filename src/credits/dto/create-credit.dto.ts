import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateCreditDto {
  @IsNotEmpty()
  @IsNumber()
  credit_amount: number;
  @IsNotEmpty()
  @IsNumber()
  hitch_amount: string;
  @IsNotEmpty()
  @IsString()
  branch_phone: string;
  @IsNotEmpty()
  @IsString()
  model_phone: string;
  @IsNotEmpty()
  @IsNumber()
  pending_payments: number;
  @IsNotEmpty()
  @IsNumber()
  current_balance: number;
  @IsNotEmpty()
  @IsString()
  imei: string;
  @IsNotEmpty()
  @IsNumber()
  weekly_payment: number;
  @IsNotEmpty()
  @IsString()
  weekly_day_payment: string;
  @IsNotEmpty()
  @IsString()
  clientCurp: string;
}


// src/common/dto/pagination.dto.ts

export class PaginationDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @IsOptional()
  @IsString()
  @Matches(/^(ASC|DESC)$/i)
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  search?: string;
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