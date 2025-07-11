import { ConfigService } from "@nestjs/config";
import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";
import { GroqService } from "src/groq/groq.service";
import { PrismaService } from "src/prisma/prisma.service";
import { Context } from "telegraf";
import { adminKeybords, clearChat, information, keybords, messagesMap, responseProfile, searchKeyboards, sendLongMessage, state } from "./utility";
import { UserService } from "src/admin/user.service";
import { Role } from "@prisma/client";
import { AdminService } from "src/admin/admin.service";
import { responce1 } from "./messages";

@Update()
export class SubmitService {
    private state: state = new Map()
    private messageMap: messagesMap = new Map()
    constructor(
        private config: ConfigService,
        private prisma: PrismaService,
        private groq: GroqService,
        private userService: UserService,
        private adminService: AdminService
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

            const sent = await ctx.reply(responseProfile(updated))
            clearChat(ctx.from!.id, this.messageMap, sent)
            this.state.delete(parseInt(userId))
            return
        }
        if (state === 'awaiting_lastName') {
            const updated = await this.prisma.user.update({ where: { telegramId: userId }, data: { lastName: text } })
            await ctx.reply(responseProfile(updated))
            this.state.delete(parseInt(userId))
            return
        }
        if (state === 'awaiting_phoneNumber') {
            const updated = await this.prisma.user.update({ where: { telegramId: userId }, data: { phone: text } })
            const sent = await ctx.reply(responseProfile(updated))
            clearChat(ctx.from!.id, this.messageMap, sent)
            this.state.delete(parseInt(userId))
            return
        }
        if (text.includes('Prof')) {
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

            const user = await this.prisma.user.findUnique({
                where: { telegramId: userId }
            });

            if (!user) {
                const sent = await ctx.reply('Siz royxatdan otmagansiz. Iltimos, /start buyrugini bosing.');
                clearChat(ctx.from!.id, this.messageMap, sent)
                return;
            }

            const sent2 = await ctx.reply(responseProfile(user));
            clearChat(ctx.from!.id, this.messageMap, sent2)
            return;
        }
        if (text.includes('Edi')) {
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

            const sent = await ctx.reply('🛠 Qaysi malumotni tahrirlashni xohlaysiz?', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '👤 Ism (firstName)', callback_data: 'edit_firstName' }],
                        [{ text: '👥 Familiya (lastName)', callback_data: 'edit_lastName' }],
                        [{ text: '📞 Telefon raqam', callback_data: 'edit_phone' }],
                    ]
                }
            });

            clearChat(ctx.from!.id, this.messageMap, sent)
            return;
        }
        if (text.includes('all')) {

            const isBocked = await this.prisma.blockedUser.findUnique({ where: { telegramId: ctx.from?.id.toString() } })
            if (isBocked) {
                const sent = await ctx.reply('sizga kirishga ruxsat yuq <<<<Siz bloklangansiz!>>>>')
                clearChat(ctx.from!.id, this.messageMap, sent)
                return
            }
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

            const result = await this.userService.getAll()
            if (!result.length) {
                const sent = await ctx.reply(' Hali hech qanday foydalanuvchi mavjud emas.');
                clearChat(ctx.from!.id, this.messageMap, sent);
                return;
            }

            const messages = result.forEach((user, index) => {
                responce1(user, ctx)
            })
            return
        }
        if (this.state.get(ctx.from!.id) === 'AWAITING_USER_ID') {
            const telegramId = text.trim()
            const user = await this.prisma.user.findUnique({
                where: { telegramId }
            });

            if (!user) {
                const sent = await ctx.reply('Bu ID boyicha foydalanuvchi topilmadi.');
                clearChat(ctx.from!.id, this.messageMap, sent);
                this.state.delete(ctx.from!.id);
                return;
            }

            responce1(user, ctx)

            this.state.delete(ctx.from!.id)
            return
        }
        if (text.includes('count')) {
            const isBocked = await this.prisma.blockedUser.findUnique({ where: { telegramId: ctx.from?.id.toString() } })
            if (isBocked) {
                const sent = await ctx.reply('sizga kirishga ruxsat yuq <<<<Siz bloklangansiz!>>>>')
                clearChat(ctx.from!.id, this.messageMap, sent)
                return
            }

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
            const result = await this.userService.userCount()

            const message = `📊 <b>Foydalanuvchilar statistikasi</b>👥 <b>Jami foydalanuvchilar:</b> <code>${result}</code>📅 <i>Bugungi holat boyicha</i>`.trim();

            const sent = await ctx.reply(message, { parse_mode: 'HTML' });
            clearChat(ctx.from!.id, this.messageMap, sent);

            return
        }
        if (text.includes('cle')) {
            const user_id = ctx.from?.id?.toString();
            if (!user_id) return;

            const isBlocked = await this.prisma.blockedUser.findUnique({
                where: { telegramId: user_id },
            });

            if (isBlocked) {
                const sent = await ctx.reply('🚫 Siz bloklangansiz!');
                clearChat(ctx.from!.id, this.messageMap, sent);
                return;
            }

            const actingUser = await this.prisma.user.findUnique({
                where: { telegramId: user_id },
            });

            if (!actingUser || actingUser.role !== Role.admin) {
                const sent = await ctx.reply('❗ Sizda bu amalni bajarishga ruxsat yoq!');
                clearChat(ctx.from!.id, this.messageMap, sent);
                return;
            }

            const userId = ctx.from?.id;
            if (!userId) return;

            const messages = this.messageMap.get(userId) || [];

            for (const messageId of messages) {
                try {
                    await ctx.telegram.deleteMessage(ctx.chat!.id, messageId);
                } catch (error) {
                    console.log('Ochirishda xatolik:', error);
                }
            }

            this.messageMap.delete(userId);

            const sent = await ctx.reply('Barchasi tozalandi /start ni bosing');

            this.messageMap.set(userId, [sent.message_id]);

            return;
        }
        if (text.includes('Hel') || text.includes('hel')) {
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
            const sent = await ctx.reply(information());

            clearChat(ctx.from!.id, this.messageMap, sent)

            return;
        }
        if (text.includes('men')) {
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
            const findUser = await this.prisma.user.findUnique({
                where: { telegramId: ctx.from?.id.toString() }
            });

            if (!findUser) {
                await ctx.reply(" Siz ro'yxatdan o'tmagansiz. /start tugmasini bosing.");
                return;
            }

            if (findUser.role === Role.user) {
                await ctx.reply('👤 Oddiy foydalanuvchi menyusi:', keybords());
            } else if (findUser.role === Role.admin || findUser.role === Role.admin) {
                await ctx.reply('🛠 Admin menyusi:', adminKeybords());
            } else {
                await ctx.reply(' Nomalum rol: ' + findUser.role);
            }

            return;
        }

        if (text === 'sea' || text === '🔍 Yana qidirish (search:)') {
            const userId = ctx.from?.id?.toString();
            if (!userId) return;

            const isBlocked = await this.prisma.blockedUser.findUnique({
                where: { telegramId: userId },
            });

            if (isBlocked) {
                try {
                    await ctx.deleteMessage();
                } catch (err) {
                    console.log('Xabarni ochirishda xato:', err.message);
                }
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
            await ctx.reply('❓ Nimani qidirmoqchisiz? "search: savolingiz" korinishida yozing.');
            return;
        }

        if (text && !text.startsWith('/') && !text.startsWith('🔍')) {
            const userId = ctx.from?.id?.toString();
            if (!userId) return;

            const isBlocked = await this.prisma.blockedUser.findUnique({
                where: { telegramId: userId },
            });

            if (isBlocked) {
                try {
                    await ctx.deleteMessage();
                } catch (err) {
                    console.log('Xabarni ochirishda xato:', err.message);
                }
                return;
            }

            const actingUser = await this.prisma.user.findUnique({
                where: { telegramId: userId },
            });

            if (!actingUser || actingUser.role !== Role.admin) {
                const sent = await ctx.reply('❗ Sizda bu amalni bajarishga ruxsat yoq!', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
                clearChat(ctx.from!.id, this.messageMap, sent);
                return;
            }
            let query = text.trim().replace('search:', '').trim();

            if (!query) {
                await ctx.reply('❗ Qidiruv matni bosh bolishi mumkin emas!');
                return;
            }

            await ctx.reply('🔍 Qidirilyapti...');
            const answer = await this.groq.ask(query);
            await sendLongMessage(ctx, answer)
            await ctx.reply(answer, searchKeyboards());
            return;
        }


        return
    }

    @Action('edit_firstName')
    async editName(@Ctx() ctx: Context) {
        const userId = ctx.from?.id.toString()
        const findUser = await this.prisma.user.findUnique(
            { where: { telegramId: userId } }
        )
        if (!findUser) {
            const sent = await ctx.reply('siz ryxoatan otmagansiz')
            clearChat(ctx.from!.id, this.messageMap, sent)
            return
        }
        this.state.set(ctx.from!.id, 'awaiting_firstName')
        const firstname = await ctx.reply('iltimos ismizni kiriting...')
        clearChat(ctx.from!.id, this.messageMap, firstname)

    }
    @Action('edit_lastName')
    async editLastName(@Ctx() ctx: Context) {
        const userId = ctx.from?.id.toString()
        const findUser = await this.prisma.user.findUnique(
            { where: { telegramId: userId } }
        )
        if (!findUser) {
            const sent = await ctx.reply('siz royxatan otmagansiz')
            clearChat(ctx.from!.id, this.messageMap, sent)
            return
        }
        this.state.set(ctx.from!.id, 'awaiting_lastName')
        const lastName = await ctx.reply('iltimos familiyangizni  kiriting...')
        clearChat(ctx.from!.id, this.messageMap, lastName)
    }
    @Action('edit_phone')
    async editPhoneNumber(@Ctx() ctx: Context) {
        const userId = ctx.from?.id.toString()
        const findUser = await this.prisma.user.findUnique(
            { where: { telegramId: userId } }
        )
        if (!findUser) {
            const sent = await ctx.reply('siz royxatan otmagansiz')
            clearChat(ctx.from!.id, this.messageMap, sent)
            return
        }
        this.state.set(ctx.from!.id, 'awaiting_phoneNumber')
        const phone = await ctx.reply('iltimos telefon raqamingizni   kiriting...')
        clearChat(ctx.from!.id, this.messageMap, phone)
    }
    @Action(/delete/)
    async deleteFun(@Ctx() ctx: Context) {
        console.log(ctx.callbackQuery?.['data']);
        const telegramId = ctx.callbackQuery?.['data'].split(":")[1]
        await this.adminService.deleteUser(ctx, telegramId)
    }
    @Action(/roleUpdate/)
    async update_role(@Ctx() ctx: Context) {
        console.log(ctx.callbackQuery?.['data'].split(":")[1]);
        const telegramId = ctx.callbackQuery?.['data'].split(":")[1]
        await this.adminService.updateRole(ctx, telegramId)
    }

}
