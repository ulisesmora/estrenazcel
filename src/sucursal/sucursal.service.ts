import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sucursal } from './entities/sucursal.entity';
import { Repository } from 'typeorm';
import { classToPlain, plainToClass } from '@nestjs/class-transformer';

@Injectable()
export class SucursalService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ){}
  async create(createSucursalDto: CreateSucursalDto) {
    const data = classToPlain(createSucursalDto);
    const sucursal = plainToClass(Sucursal, data);
    return await sucursal.save();
  }

  async findAll() {
    return await this.sucursalRepository.find();
  }

  async findOne(id: number) {
    const suc = await this.sucursalRepository.findOne({ where: { id } });
    if (!suc) {
      throw new NotFoundException('id not found ');
    }
    return suc;
  }

  async update(id: number, updateSucursalDto: CreateSucursalDto) {
    return `This action updates a #${id} sucursal`;
  }

  async remove(id: number) {
    const suc = await this.findOne(id);
    return await suc.softRemove();
  }
}
