import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as dotenv from "dotenv"
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SubmitService } from './submits.service';
import { BotServices } from './bot-service';
import { GroqModule } from 'src/groq/groq.module';
import { AdminModule } from 'src/admin/admin.module';
dotenv.config()
@Module({
  imports: [TelegrafModule.forRoot({
    token: process.env.Bot_token as string
  }), PrismaModule, ConfigModule, GroqModule,AdminModule],
  providers: [BotService, SubmitService, BotServices]
})
export class BotModule { }
