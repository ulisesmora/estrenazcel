import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';
import { classToPlain, plainToClass } from '@nestjs/class-transformer';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const data = classToPlain(createCompanyDto);
    const company = plainToClass(Company, data);
    return await company.save();
  }

  async findAll() {
    return await this.companyRepository.find();
  }

  async findOne(id: number) {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('id not found ');
    }
    return company;
  }

  async update(id: number, updateCompanyDto: CreateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  async remove(id: number) {
    const company = await this.findOne(id);
    return await company.softRemove();
  }
}
