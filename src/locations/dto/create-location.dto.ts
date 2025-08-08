import {
  IsNotEmpty,
  IsString,
  IsLatitude,
  IsLongitude,
  Length,
  IsNumber,
} from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty({ message: 'El IMEI es requerido' })
  @IsString({ message: 'El IMEI debe ser una cadena de texto' })
  @Length(15, 15, { message: 'El IMEI debe tener exactamente 15 caracteres' })
  imei: string;

  @IsNotEmpty({ message: 'La latitud es requerida' })
  @IsNumber()
  @IsLatitude({ message: 'La latitud debe ser un valor válido entre -90 y 90' })
  latitude: number;

  @IsNotEmpty({ message: 'La longitud es requerida' })
  @IsNumber()
  @IsLongitude({
    message: 'La longitud debe ser un valor válido entre -180 y 180',
  })
  longitude: number;
}
