import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Context } from 'telegraf';
import { UserService } from './user.service';
import { Role } from '@prisma/client';
import { clearChat, messagesMap, responseProfile, state } from 'src/bot/utility';
import { responce1 } from 'src/bot/messages';

@Injectable()
export class AdminService {
    private messageMap: messagesMap = new Map()
    private state = new Map<number, any>()
    constructor(private prisma: PrismaService, private userService: UserService) { }
    async getProfile(ctx: Context) {
        const existsUser = await this.prisma.user.findUnique({ where: { telegramId: ctx.from!.id.toString() } })
        if (!existsUser) {
            const sent = await ctx.reply('birinchi register qilishi bu tugmani /start bosing')
            clearChat(ctx.from!.id, this.messageMap, sent)
            return
        }
        if (existsUser!.role !== Role.admin) {
            const sent = await ctx.reply('you aren\'t allowed! ')
            clearChat(ctx.from!.id, this.messageMap, sent)
            return
        }

        const sent = await ctx.reply(responseProfile(existsUser!))
        clearChat(ctx.from!.id, this.messageMap, sent)
        return
    }
    async deleteUser(ctx: Context, telegramId: string) {
        try {
            const userId = ctx.from?.id?.toString();
            if (!userId) return;

            const isBlocked = await this.prisma.blockedUser.findUnique({
                where: { telegramId: userId },
            });

            if (isBlocked) {
                const sent = await ctx.reply('Sizga kirishga ruxsat yoq. <<Siz bloklangansiz!>>');
                clearChat(ctx.from!.id, this.messageMap, sent);
                return;
            }

            const existsUser = await this.prisma.user.findUnique({
                where: { telegramId: userId },
            });

            if (!existsUser) {
                const sent = await ctx.reply('ℹ️ Avval royxatdan otishingiz kerak. /start tugmasini bosing.');
                clearChat(ctx.from!.id, this.messageMap, sent);
                return;
            }

            if (existsUser.role !== Role.admin) {
                const sent = await ctx.reply('❗ Sizda bu amalni bajarishga ruxsat yoq!');
                clearChat(ctx.from!.id, this.messageMap, sent);
                return;
            }
            const result = await this.prisma.user.delete({
                where: {
                    telegramId
                }
            })
            const chatId = ctx.callbackQuery?.message?.chat.id
            const message_id = ctx.callbackQuery?.message?.message_id
            ctx.telegram.deleteMessage(chatId!, message_id!)
            ctx.reply(`${chatId} ${message_id} ${result.firstName} chopildi!!`)

        } catch (error) {
            ctx.reply(error)
        }
    }
    async updateRole(ctx: Context, telegramId: string) {
        const userId = ctx.from?.id?.toString();
        if (!userId) return;

        const isBlocked = await this.prisma.blockedUser.findUnique({
            where: { telegramId: userId },
        });

        if (isBlocked) {
            const sent = await ctx.reply('🚫 Siz bloklangansiz!');
            clearChat(ctx.from!.id, this.messageMap, sent);
            return;
        }

        const actingUser = await this.prisma.user.findUnique({
            where: { telegramId: userId },
        });

        if (!actingUser || actingUser.role !== Role.admin) {
            const sent = await ctx.reply('❗ Sizda bu amalni bajarishga ruxsat yoq!');
            clearChat(ctx.from!.id, this.messageMap, sent);
            return;
        }

        const targetUser = await this.prisma.user.findUnique({
            where: { telegramId },
        });

        if (!targetUser) {
            const sent = await ctx.reply(`❌ Telegram ID: <code>${telegramId}</code> boyicha foydalanuvchi topilmadi.`, { parse_mode: 'HTML' });
            clearChat(ctx.from!.id, this.messageMap, sent);
            return;
        }

        const newRole = targetUser.role === Role.admin ? Role.user : Role.admin;

        const updatedUser = await this.prisma.user.update({
            where: { telegramId },
            data: { role: newRole },
            select: {
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                telegramId: true,
                username: true
            }
        });


        responce1(updatedUser, ctx, true);
    }
}
