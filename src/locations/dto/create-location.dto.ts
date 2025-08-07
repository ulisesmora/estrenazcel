import {
  IsNotEmpty,
  IsString,
  IsLatitude,
  IsLongitude,
  Length,
} from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty({ message: 'El IMEI es requerido' })
  @IsString({ message: 'El IMEI debe ser una cadena de texto' })
  @Length(15, 15, { message: 'El IMEI debe tener exactamente 15 caracteres' })
  imei: string;

  @IsNotEmpty({ message: 'La latitud es requerida' })
  @IsString({ message: 'La latitua debe ser una cadena de texto' })
  @IsLatitude({ message: 'La latitud debe ser un valor válido entre -90 y 90' })
  latitude: string;

  @IsNotEmpty({ message: 'La longitud es requerida' })
  @IsString({ message: 'La longitud debe ser una cadena de texto' })
  @IsLongitude({
    message: 'La longitud debe ser un valor válido entre -180 y 180',
  })
  longitude: string;
}
