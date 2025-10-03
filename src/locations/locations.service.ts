import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Repository } from 'typeorm';
import { classToPlain, plainToClass } from '@nestjs/class-transformer';
import { PaginationDto } from 'src/credits/dto/create-credit.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly creditRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto) {
    try {
      const data = classToPlain(createLocationDto);
      const credit = plainToClass(Location, data);
      return await credit.save();
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      //where.imei = { imei: Like(`%${search}%`) };
      // O puedes hacer búsqueda en múltiples campos con OR
      where.imei = search;
    }

    const [data, total] = await this.creditRepository.findAndCount({
      where,
      order: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }
}
