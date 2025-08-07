import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CreditsModule } from './credits/credits.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { CompanyModule } from './company/company.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { VoucherModule } from './voucher/voucher.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm-config';
import { AppController } from './app.controller';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    CreditsModule,
    PaymentsModule,
    AdminModule,
    CompanyModule,
    SucursalModule,
    VoucherModule,
    LocationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
