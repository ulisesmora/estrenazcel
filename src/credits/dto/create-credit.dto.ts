import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
