import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";
import { PrismaService } from "src/prisma/prisma.service";
import { Context } from "telegraf";
import * as dotenv from "dotenv"
import { ConfigService } from "@nestjs/config";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
dotenv.config()
@Update()
export class BotService {
    constructor(private service: PrismaService, private config: ConfigService) { }
    @Start()
    async start(@Ctx() ctx: Context) {
        const datas = ctx.from;
        const findUser = await this.service.user.findUnique({
            where: { telegramId: datas?.id.toString() }
        });

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

            await ctx.reply(' Botdan foydalanish uchun quyidagi kanallarga obuna boling:', {
                reply_markup: {
                    inline_keyboard: buttons
                }
            });

            return;
        }

        const telegramId = ctx.from?.id?.toString();
        if (!telegramId) return;

        if (findUser) {
            ctx.reply('Siz royxatdan otgansiz. Quyidagilardan birini tanlang:', {
                reply_markup: {
                    keyboard: [
                        [{ text: 'Profile' }],
                        [{ text: 'Edit' }],
                        [{ text: '/start' }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
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
            await ctx.reply(
                ` Siz hali quyidagi kanallarga obuna bolmagansiz:\n\n` +
                notSubscripted.map(ch => `🔸 ${ch}`).join('\n') +
                `\n\nIltimos, avval obuna boling.`
            );
        } else {
            await ctx.reply('✅ Obuna tekshirildi. Endi botdan foydalanishingiz mumkin!');

            await ctx.reply('tel raqamingizni kiriting!', {
                reply_markup: {
                    keyboard: [
                        [{ text: 'contact share', request_contact: true }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
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
            await ctx.reply('contact qoshildi qaytattan /start bosing!')
        } catch (error) {
            console.error(' Upsert xatoligi:', error);
            await ctx.reply('Kontaktni saqlashda xatolik yuz berdi.');
        }
    }


}
