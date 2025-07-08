import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as dotenv from "dotenv"
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SubmitService } from './submits.service';
dotenv.config()
@Module({
  imports: [TelegrafModule.forRoot({
    token: process.env.Bot_token as string
  }),PrismaModule,ConfigModule],
  providers: [BotService,SubmitService]
})
export class BotModule { }
