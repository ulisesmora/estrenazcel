import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Company } from 'src/company/entities/company.entity';
import { Credit } from 'src/credits/credit.entity';
import { Sucursal } from 'src/sucursal/entities/sucursal.entity';
import { User } from 'src/users/user.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'luquillas',
  database: 'estrenazcel',
  entities: [Admin,Company,Credit,Sucursal, User, Voucher],
  synchronize: true,
};
