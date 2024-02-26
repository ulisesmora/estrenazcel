import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { CreditsModule } from 'src/credits/credits.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), CreditsModule, CompanyModule],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [TypeOrmModule],
})
export class VoucherModule {}
