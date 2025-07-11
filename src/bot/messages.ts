import { User } from "@prisma/client";
import { Context } from "telegraf";

export const responce1 = async (user: Partial<User>, ctx: Context, edit: boolean = false) => {
    const msg = `
👤 <b>Foydalanuvchi ma'lumotlari</b>

🆔 <b>ID:</b> <code>${user.telegramId}</code>
👤 <b>Ism:</b> ${user.firstName || 'Kiritilmagan'}
👥 <b>Familiya:</b> ${user.lastName || 'Kiritilmagan'}
📞 <b>Telefon:</b> ${user.phone || 'Kiritilmagan'}
🔐 <b>Roli:</b> <code>${user.role}</code>
`.trim();

    const keyboard = {
        parse_mode: 'HTML' as const,
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🗑 Ochirish', callback_data: `delete:${user.telegramId}` },
                    { text: `Rolni  (${user.role})`, callback_data: `roleUpdate:${user.telegramId}` }
                ]
            ]
        }
    };

    if (edit && ctx.chat && ctx.callbackQuery?.message?.message_id) {
        await ctx.telegram.editMessageText(
            ctx.chat.id,
            ctx.callbackQuery.message.message_id,
            undefined,
            msg,
            keyboard
        );
    } else {
        await ctx.reply(msg, keyboard);
    }
};
