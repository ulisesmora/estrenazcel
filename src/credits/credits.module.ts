import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';

@Module({
  providers: [CreditsService],
  controllers: [CreditsController]
})
export class CreditsModule {}
