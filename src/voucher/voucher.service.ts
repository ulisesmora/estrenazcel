import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVoucherDto, PaginatedResultDto, PaginationParamsDto, SearchVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { Brackets, Repository } from 'typeorm';
import { classToPlain, plainToClass } from '@nestjs/class-transformer';
import { Company } from 'src/company/entities/company.entity';
import { Credit } from 'src/credits/credit.entity';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
  ) {}
  async create(
    createVoucherDto: CreateVoucherDto,
    credit: Credit,
    company: Company,
  ) {
    try {
    const data = classToPlain(createVoucherDto);
    const voucher = plainToClass(Voucher, data);
    voucher.credit = credit;
    voucher.company = company;
    return await voucher.save();
    } catch (error) {
      console.log(error);  
    }
  }

  async findAll(paginationParams: PaginationParamsDto) {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'ASC' } = paginationParams;
  
    const [vouchers, total] = await this.voucherRepository.findAndCount({
      relations: {
        credit: true,
        company: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [sortBy]: sortOrder,
      },
    });
  
    return {
      data: vouchers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const voucher = await this.voucherRepository.findOne({
      where: { id },
      relations: { company: true, credit: true },
    });
    if (!voucher) {
      throw new NotFoundException(`id ${id} not found`);
    }
    return voucher;
  }

  update(id: number, updateVoucherDto: CreateVoucherDto) {
    return `This action updates a #${id} voucher`;
  }

  async remove(id: number) {
    const voucher = await this.findOne(id);
    return await voucher.softRemove();
  }

  async searchCredits(searchParams: SearchVoucherDto): Promise<PaginatedResultDto<Voucher>> {
    const { page = 1, limit = 10, ...filters } = searchParams;
    const skip = (page - 1) * limit;
  
    const queryBuilder = this.voucherRepository
      .createQueryBuilder('credit')
      .leftJoinAndSelect('voucher.credit', 'credit')
      .leftJoinAndSelect('credit.sucursal', 'sucursal');
  
    // Construcción dinámica de condiciones de búsqueda
    if (Object.keys(filters).length > 0) {
      queryBuilder.where(
        new Brackets((qb) => {
          for (const [key, value] of Object.entries(filters)) {
            if (value) {
              // Búsqueda en campos de Credit
              if (this.voucherRepository.metadata.propertiesMap[key]) {
                qb.orWhere(`voucher.${key} ILIKE :${key}`, { 
                  [key]: `%${value}%` 
                });
              }
              // Búsqueda en relaciones (user o sucursal)
              else if (key.includes('.')) {
                const [relation, field] = key.split('.');
                if (['voucher', 'sucursal'].includes(relation)) {
                  qb.orWhere(`${relation}.${field} ILIKE :${key}`, { 
                    [key]: `%${value}%` 
                  });
                }
              }
            }
          }
        })
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
