import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { PaginationDto } from 'src/credits/dto/create-credit.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.locationsService.findAll(paginationDto);
  }

  @Get('imeis')
  findAllImeis() {
    return this.locationsService.findImeis();
  }
}
