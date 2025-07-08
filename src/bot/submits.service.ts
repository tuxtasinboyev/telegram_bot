import { ConfigService } from "@nestjs/config";
import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";
import { PrismaService } from "src/prisma/prisma.service";
import { Context } from "telegraf";

@Update()
export class SubmitService {
    private state = new Map<number, string>()
    constructor(
        private config: ConfigService,
        private prisma: PrismaService
    ) { }

    @On('text')
    async onText(@Ctx() ctx: Context) {
        if (!('text' in ctx.message!)) return;

        const text = ctx.message.text;
        const userId = ctx.from?.id?.toString();
        if (!userId) return;

        const state = this.state.get(ctx.from!.id)
        if (state === 'awaiting_firstName') {
            const updated = await this.prisma.user.update({ where: { telegramId: userId }, data: { firstName: text } })

            await ctx.reply(
                `
                🧾 <b>Profil Ma'lumotlari:</b>\n\n` +
                `🆔 <b>Telegram ID:</b> <code>${updated.telegramId}</code>\n` +
                `👤 <b>Ism:</b> ${updated.firstName}\n` +
                `👥 <b>Familiya:</b> ${updated.lastName}\n` +
                `📞 <b>Telefon:</b> ${updated.phone || 'Kiritilmagan'}`,
                { parse_mode: 'HTML' }
            )
            this.state.delete(parseInt(userId))
            return
        }
        if (state === 'awaiting_lastName') {
            const updated = await this.prisma.user.update({ where: { telegramId: userId }, data: { lastName: text } })
            await ctx.reply(
                `
                🧾 <b>Profil Ma'lumotlari:</b>\n\n` +
                `🆔 <b>Telegram ID:</b> <code>${updated.telegramId}</code>\n` +
                `👤 <b>Ism:</b> ${updated.firstName}\n` +
                `👥 <b>Familiya:</b> ${updated.lastName}\n` +
                `📞 <b>Telefon:</b> ${updated.phone || 'Kiritilmagan'}`,
                { parse_mode: 'HTML' }
            )
            this.state.delete(parseInt(userId))
            return
        }
        if (state === 'awaiting_phoneNumber') {
            const updated = await this.prisma.user.update({ where: { telegramId: userId }, data: { phone: text } })
            await ctx.reply(
                `
                🧾 <b>Profil Ma'lumotlari:</b>\n\n` +
                `🆔 <b>Telegram ID:</b> <code>${updated.telegramId}</code>\n` +
                `👤 <b>Ism:</b> ${updated.firstName}\n` +
                `👥 <b>Familiya:</b> ${updated.lastName}\n` +
                `📞 <b>Telefon:</b> ${updated.phone || 'Kiritilmagan'}`,
                { parse_mode: 'HTML' }
            )
            this.state.delete(parseInt(userId))
            return
        }
        if (text.startsWith('Prof')) {
            const user = await this.prisma.user.findUnique({
                where: { telegramId: userId }
            });

            if (!user) {
                await ctx.reply('Siz royxatdan otmagansiz. Iltimos, /start buyrugini bosing.');
                return;
            }

            await ctx.reply(
                `🧾 <b>Profil Ma'lumotlari:</b>\n\n` +
                `🆔 <b>Telegram ID:</b> <code>${user.telegramId}</code>\n` +
                `👤 <b>Ism:</b> ${user.firstName}\n` +
                `👥 <b>Familiya:</b> ${user.lastName}\n` +
                `📞 <b>Telefon:</b> ${user.phone || 'Kiritilmagan'}`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        if (text === 'Edit') {
            await ctx.reply('🛠 Qaysi malumotni tahrirlashni xohlaysiz?', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '👤 Ism (firstName)', callback_data: 'edit_firstName' }],
                        [{ text: '👥 Familiya (lastName)', callback_data: 'edit_lastName' }],
                        [{ text: '📞 Telefon raqam', callback_data: 'edit_phone' }],
                    ]
                }
            });

            return;
        }

        await ctx.reply('tugri kiriting');
    }
    @Action('edit_firstName')
    async editName(@Ctx() ctx: Context) {
        const userId = ctx.from?.id.toString()
        const findUser = await this.prisma.user.findUnique(
            { where: { telegramId: userId } }
        )
        if (!findUser) {
            await ctx.reply('siz royxatan otmagansiz')
            return
        }
        this.state.set(ctx.from!.id, 'awaiting_firstName')
        const firstname = await ctx.reply('iltimos ismizni kiriting...')

    }
    @Action('edit_lastName')
    async editLastName(@Ctx() ctx: Context) {
        const userId = ctx.from?.id.toString()
        const findUser = await this.prisma.user.findUnique(
            { where: { telegramId: userId } }
        )
        if (!findUser) {
            await ctx.reply('siz royxatan otmagansiz')
            return
        }
        this.state.set(ctx.from!.id, 'awaiting_lastName')
        const firstname = await ctx.reply('iltimos familiyangizni  kiriting...')

    }
    @Action('edit_phone')
    async editPhoneNumber(@Ctx() ctx: Context) {
        const userId = ctx.from?.id.toString()
        const findUser = await this.prisma.user.findUnique(
            { where: { telegramId: userId } }
        )
        if (!findUser) {
            await ctx.reply('siz royxatan otmagansiz')
            return
        }
        this.state.set(ctx.from!.id, 'awaiting_phoneNumber')
        const firstname = await ctx.reply('iltimos telefon raqamingizni   kiriting...')

    }

}
