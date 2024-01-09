import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CreditsModule } from './credits/credits.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [UsersModule, CreditsModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
