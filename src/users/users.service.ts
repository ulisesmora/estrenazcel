import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { classToPlain, plainToClass } from '@nestjs/class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const data = classToPlain(createUserDto);
      const client = plainToClass(User, data);
      return await client.save();
    } catch (error) {
      console.log(error);

      // throw new InternalServerErrorException('user duplicate existed');
    }
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('id not find');
    }
    return user;
  }

  async findByCurp(curp: string) {
    const user = await this.userRepository.findOne({
      where: { clientCurp: curp },
    });
    if (!user) {
      throw new NotFoundException('id not find');
    }
    return user;
  }

  async findSearch(phone: string, email: string, curp: string) {
    const pho = phone ? phone : null;
    const em = email ? email : null;
    const cu = curp ? curp : null;
    console.log(pho, em, cu);
    const user = await this.userRepository.findOne({
      where: { clientPhoneNumber: pho, clientCurp: cu, clientEmail: em },
      relations: ['credit', 'credit.voucher', 'credit.voucher.company'],
    });
    if (!user) {
      throw new NotFoundException('id not find');
    }
    return user;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return user.softRemove();
  }
}
