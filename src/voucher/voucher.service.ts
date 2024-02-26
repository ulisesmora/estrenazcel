import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { Repository } from 'typeorm';
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
    const data = classToPlain(createVoucherDto);
    const voucher = plainToClass(Voucher, data);
    voucher.credit = credit;
    voucher.company = company;
    return await voucher.save();
  }

  async findAll() {
    return await this.voucherRepository.find({
      relations: {
        credit: true,
        company: true,
      },
    });
  }

  async findOne(id: number) {
    const voucher = await this.voucherRepository.findOne({ where: { id } });
    if (!voucher) {
      throw new NotFoundException('id not found');
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
}
