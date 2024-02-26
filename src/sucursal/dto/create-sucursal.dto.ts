import { IsNotEmpty, IsString } from "class-validator";

export class CreateSucursalDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
