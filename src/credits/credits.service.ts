import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credit } from './credit.entity';
import { Repository } from 'typeorm';
import { CreateCreditDto } from './dto/create-credit.dto';
import { classToPlain, plainToClass } from '@nestjs/class-transformer';
import { User } from 'src/users/user.entity';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Credit)
    private readonly creditRepository: Repository<Credit>,
  ) {}

  async create(createCompanyDto: CreateCreditDto, user: User) {
    const data = classToPlain(createCompanyDto);
    const credit = plainToClass(Credit, data);
    credit.user = user;
    return await credit.save();
  }

  async findAll() {
    return await this.creditRepository.find({
      relations: {
        user: true,
        sucursal: true,
      },
    });
  }

  async findOne(id: number) {
    const credit = await this.creditRepository.findOne({ where: { id } });
    if (!credit) {
      throw new NotFoundException('id not found ');
    }
    return credit;
  }

  async findOneByImei(id: string) {
    const credit = await this.creditRepository.findOne({ where: { imei: id } });
    if (!credit) {
      throw new NotFoundException('id not found ');
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
