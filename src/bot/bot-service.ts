import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";

@Injectable()
export class BotServices implements OnModuleInit {
    constructor(@InjectBot() private readonly bot: Telegraf<any>) { }
    async onModuleInit() {
        this.bot.telegram.setMyCommands([
            {
                command: 'start', description: "xush kelibsiz shuni bosing <</start>>"
            },
            {
                command: 'menu', description: 'Marhamat'
            },
            {
                command: 'help', description: ' Sizga yordam kerak bolsa shuni <<Help>> kiriting '
            }
        ])
    }
}