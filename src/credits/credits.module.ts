import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credit } from './credit.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Credit]), UsersModule],
  providers: [CreditsService],
  controllers: [CreditsController],
  exports: [TypeOrmModule, CreditsService],
})
export class CreditsModule {}
