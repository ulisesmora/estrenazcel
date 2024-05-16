import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber } from 'class-validator';

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
