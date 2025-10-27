import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credit } from './credit.entity';
import { Brackets, Like, Repository } from 'typeorm';
import {
  CreateCreditDto,
  PaginatedResultDto,
  PaginationDto,
  SearchCreditDto,
} from './dto/create-credit.dto';
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

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResultDto<Credit>> {
    const { page, limit, sortBy, sortOrder, search } = paginationDto;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      where = [
        { user: { name: Like(`%${search}%`) } },
        { sucursal_name: Like(`%${search}%`) },
      ];
    }

    const [data, total] = await this.creditRepository.findAndCount({
      relations: {
        user: true,
        sucursal: true,
      },
      where,
      order: {
        [sortBy || 'id']: sortOrder || 'DESC',
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

  async findDistinctSucursalNames(): Promise<string[]> {
    const result = await this.creditRepository
      .createQueryBuilder('credit')
      .select('DISTINCT credit.sucursal_name', 'sucursal_name')
      .where('credit.sucursal_name IS NOT NULL')
      .andWhere("credit.sucursal_name != ''")
      .orderBy('credit.sucursal_name', 'ASC')
      .getRawMany();
    return result.map((row) => row.sucursal_name);
  }

  async findCreditsBySucursal(sucursal: string) {
    try {
      const credits = await this.creditRepository.find({
        where: { sucursal_name: sucursal },
        relations: { user: true },
      });
      return credits;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No se encontraron resultados');
    }
  }

  async update(id: number, updateCompanyDto: CreateCreditDto) {
    return `This action updates a #${id} company`;
  }

  async remove(id: number) {
    const credit = await this.findOne(id);
    return await credit.softRemove();
  }

  async searchCredits(
    searchParams: SearchCreditDto,
  ): Promise<PaginatedResultDto<Credit>> {
    const { page = 1, limit = 10, ...filters } = searchParams;
    const skip = (page - 1) * limit;

    const queryBuilder = this.creditRepository
      .createQueryBuilder('credit')
      .leftJoinAndSelect('credit.user', 'user')
      .leftJoinAndSelect('credit.sucursal', 'sucursal');

    // Construcción dinámica de condiciones de búsqueda
    if (Object.keys(filters).length > 0) {
      queryBuilder.where(
        new Brackets((qb) => {
          for (const [key, value] of Object.entries(filters)) {
            if (value) {
              // Búsqueda en campos de Credit
              if (this.creditRepository.metadata.propertiesMap[key]) {
                qb.orWhere(`credit.${key} ILIKE :${key}`, {
                  [key]: `%${value}%`,
                });
              }
              // Búsqueda en relaciones (user o sucursal)
              else if (key.includes('.')) {
                const [relation, field] = key.split('.');
                if (['user', 'sucursal'].includes(relation)) {
                  qb.orWhere(`${relation}.${field} ILIKE :${key}`, {
                    [key]: `%${value}%`,
                  });
                }
              }
            }
          }
        }),
      );
    }

    // Aplicar paginación
    queryBuilder.skip(skip).take(limit);

    // Obtener resultados y total
    const [data, total] = await queryBuilder.getManyAndCount();

    if (data.length === 0) {
      throw new NotFoundException('No se encontraron resultados');
    }

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
