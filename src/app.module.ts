import { MiddlewareConsumer, Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GroqModule } from './groq/groq.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [BotModule, PrismaModule, ConfigModule.forRoot({ isGlobal: true }), GroqModule, AdminModule],
})
export class AppModule { }
