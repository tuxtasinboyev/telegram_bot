import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";
import { PrismaService } from "src/prisma/prisma.service";
import { Context } from "telegraf";
import * as dotenv from "dotenv"
import { ConfigService } from "@nestjs/config";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { adminKeybords, clearChat, keybords, messagesMap, welcomeText } from "./utility";
import { Role } from "@prisma/client";
dotenv.config()
@Update()
export class BotService {
    private messageMap: messagesMap = new Map()
    constructor(private service: PrismaService, private config: ConfigService) { }
    @Start()
    async start(@Ctx() ctx: Context) {
        const datas = ctx.from;
        const findUser = await this.service.user.findUnique({
            where: { telegramId: datas?.id.toString() }
        });

        const userId = ctx.from?.id?.toString();
        if (!userId) return;

        const telegramId = ctx.from?.id?.toString();
        if (!telegramId) return;


        if (findUser) {
            if (findUser.role === Role.admin) {
                const sent = await ctx.reply('Siz royxatdan otgansiz. Quyidagilardan birini tanlang:', adminKeybords());
                clearChat(datas!.id, this.messageMap, sent)
            }
            else {
                const sent = await ctx.reply('Siz royxatdan otgansiz. Quyidagilardan birini tanlang:', keybords());
                clearChat(datas!.id, this.messageMap, sent)
            }
            return;
        }

        if (!findUser) {
            const channels = this.config.get<string>('REQUIRED_CHANNELS')?.split(',') || [];

            const buttons: InlineKeyboardButton[][] = channels.map((ch) => [{
                text: `📢 Kanal: ${ch}`,
                url: `https://t.me/${ch.replace('@', '')}`
            }]);

            buttons.push([{
                text: '✅ Obuna boldim',
                callback_data: 'check_subs'
            }]);

            const sent = await ctx.reply(welcomeText(), {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: buttons
                }
            }
            );

            clearChat(datas!.id, this.messageMap, sent)

            return;
        }
    }


    @Action('check_subs')
    async checkSubmit(@Ctx() ctx: Context) {
        const channels = this.config.get<string>('REQUIRED_CHANNELS')?.split(',') || [];
        const notSubscripted: string[] = [];

        for (const channel of channels) {
            try {
                const member = await ctx.telegram.getChatMember(channel, ctx.from!.id);

                if (member.status !== 'member' && member.status !== 'administrator' && member.status !== 'creator') {
                    notSubscripted.push(channel);
                }
            } catch (error) {
                console.error(`Tekshirib bolmadi: ${channel}`, error);
                notSubscripted.push(channel);
            }
        }

        if (notSubscripted.length > 0) {
            const sent = await ctx.reply(
                ` Siz hali quyidagi kanallarga obuna bolmagansiz:\n\n` +
                notSubscripted.map(ch => `🔸 ${ch}`).join('\n') +
                `\n\nIltimos, avval obuna boling.`
            );
            clearChat(ctx.from!.id, this.messageMap, sent)

        } else {
            const sent = await ctx.reply('✅ Obuna tekshirildi. Endi botdan foydalanishingiz mumkin!');

            clearChat(ctx.from!.id, this.messageMap, sent)
            const sent2 = await ctx.reply('tel raqamingizni kiriting!', {
                reply_markup: {
                    keyboard: [
                        [{ text: 'contact share', request_contact: true }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });

            clearChat(ctx.from!.id, this.messageMap, sent2)
        }
    }

    @On('contact')
    async requestContact(@Ctx() ctx: Context) {
        const userId = ctx.from?.id;

        if (!userId || !('contact' in ctx.message!)) {
            return ctx.reply('xatolik yuz berdi')
        }

        try {
            await this.service.user.upsert({
                where: { telegramId: userId.toString() }, update: {
                    telegramId: userId.toString(),
                    firstName: ctx.from.first_name,
                    lastName: ctx.from.last_name,
                    phone: ctx.message.contact.phone_number
                }, create: {
                    telegramId: userId.toString(),
                    firstName: ctx.from.first_name,
                    lastName: ctx.from.last_name,
                    phone: ctx.message.contact.phone_number
                }
            })

            const sent2 = await ctx.reply('contact qoshildi qaytattan /start bosing!')
            if (ctx.from?.id) {
                const ids = this.messageMap.get(ctx.from?.id) || [];
                ids.push(sent2.message_id);
                this.messageMap.set(ctx.from?.id, ids);
            }
            const existsUser = await this.service.user.findUnique({ where: { telegramId: ctx.from.id.toString() } })
            if (existsUser!.role === Role.admin) {
                const sent = await ctx.reply('Xush kelibsiz Admin Janoblari!!', adminKeybords())
                clearChat(ctx.from!.id, this.messageMap, sent)
                return
            }

        } catch (error) {
            console.error(' Upsert xatoligi:', error);
            const sent2 = await ctx.reply('Kontaktni saqlashda xatolik yuz berdi.');
            clearChat(ctx.from!.id, this.messageMap, sent2)
        }
    }



}
