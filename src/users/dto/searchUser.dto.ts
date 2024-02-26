import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber } from 'class-validator';

export class SearchUserDto {
  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;
  @IsNotEmpty()
  @IsPhoneNumber()
  clientPhoneNumber: string;
  @IsNotEmpty()
  @IsString()
  clientCurp: string;
}
