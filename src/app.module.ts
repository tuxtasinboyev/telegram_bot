import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [BotModule, PrismaModule, ConfigModule.forRoot({})],
})
export class AppModule { }
