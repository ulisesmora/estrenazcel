import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsOptional, IsNumber, Min  } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsNotEmpty()
  @IsString()
  secondName: string;
  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;
  @IsNotEmpty()
  clientPhoneNumber: string;
  @IsNotEmpty()
  @IsString()
  clientCurp: string;
}



export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

// src/common/dto/paginated-result.dto.ts
export interface PaginatedResultDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    last_page: number;
  };
}