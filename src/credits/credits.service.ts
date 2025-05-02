import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credit } from './credit.entity';
import { Like, Repository } from 'typeorm';
import { CreateCreditDto, PaginatedResultDto, PaginationDto } from './dto/create-credit.dto';
import { classToPlain, plainToClass } from '@nestjs/class-transformer';
import { User } from 'src/users/user.entity';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Credit)
    private readonly creditRepository: Repository<Credit>,
  ) {}

  async create(createCompanyDto: CreateCreditDto, user: User) {
    try {
    const data = classToPlain(createCompanyDto);
    const credit = plainToClass(Credit, data);
    credit.user = user;
    return await credit.save();
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResultDto<Credit>> {
    const { page, limit, sortBy, sortOrder, search } = paginationDto;
    const skip = (page - 1) * limit;
  
    const where: any = {};
    if (search) {
      where.user = { name: Like(`%${search}%`) };
      // O puedes hacer búsqueda en múltiples campos con OR
    }
  
    const [data, total] = await this.creditRepository.findAndCount({
      relations: {
        user: true,
        sucursal: true,
      },
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
  async findOne(id: number) {
    const credit = await this.creditRepository.findOne({ where: { id } });
    if (!credit) {
      throw new NotFoundException(`id ${id} not found`);
    }
    return credit;
  }

  async findOneByImei(id: string) {
    const credit = await this.creditRepository.findOne({
      where: { imei: id },
      relations: { user: true },
    });
    if (!credit) {
      console.log(`id ${id} not found`);
      //throw new NotFoundException(`id ${id} not found`);
    }
    return credit;
  }

  async update(id: number, updateCompanyDto: CreateCreditDto) {
    return `This action updates a #${id} company`;
  }

  async remove(id: number) {
    const credit = await this.findOne(id);
    return await credit.softRemove();
  }
}
