import { User } from "@prisma/client";
import { Context } from "telegraf";

export type messagesMap = Map<number, number[]>
export type state = Map<number, string>
export const responseProfile = (data: User): string => {
    return `
🧾 Profil Ma'lumotlari:

🆔 Telegram ID:${data.telegramId}
👤 Ism:${data.firstName}
👥 Familiya:${data.lastName || 'Kiritilmagan'}
📞 Telefon:${data.phone || 'Kiritilmagan'}
  `.trim();
};
export const clearChat = (id: number, messageMap: messagesMap, sent: { message_id: number }) => {
    if (!id) return
    const ids = messageMap.get(id) || []
    ids?.push(sent.message_id)
    messageMap.set(id, ids!)

}
export const information = (): string => {
    return `
                    🆘 Yordam bo'limi

                    Quyidagi funksiyalar sizga botdan to'g'ri foydalanishda yordam beradi:

                    🔹 /start— Botni ishga tushiradi va ro'yxatdan o'tasiz.

                    🔹 📄 Profile— Sizning shaxsiy malumotlaringizni ko'rsatadi.

                    🔹 ✏️ Edit— Ism, familiya yoki telefon raqamingizni o'zgartirishingiz mumkin.

                    🔹 🧹 Clear— Bot yuborgan xabarlarni tozalaydi.

                    🔹 ℹ️ Help— Yordam va ko'rsatmalar oynasini ko'rsatadi.

                    ❓ Qo'shimcha savollar bo'lsa: @omadbek_tuxtasinboyev_1709
        `.trim();
};

export const keybords = () => {
    return {
        reply_markup: {
            keyboard: [
                [
                    { text: '🔹 Profile 🔹' },
                    { text: '🔸 Edit 🔸' }
                ],
                [
                    { text: '📘 Help' },
                    { text: '🧹 clear' }
                ],
                [
                    { text: '🔍 search:' }
                ]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
};

export const adminKeybords = () => {
    return {
        reply_markup: {
            keyboard: [
                [
                    { text: '🔘  Profile  🔘' },
                    { text: '🛠  Edit  🛠' }
                ],
                [
                    { text: '📚  Help  📚' },
                    { text: '🧹  clear  🧹' },
                    { text: '🔍  search:  🔍' }
                ],
                [
                    { text: '🔹 Blocklanganlarni korish' },
                    { text: '👥  allUsers  👥' },
                    { text: '📊  countUsers  📊' }
                ]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };
};

export const searchKeyboards = () => {
    return {
        reply_markup: {
            keyboard: [
                [{ text: '🔍 Yana qidirish (search:)' }],
                [{ text: '🏠 Bosh menyu' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    }
}
export const welcomeText = (): string => {
    return `
👋 <b>Xush kelibsiz!</b>

Ushbu bot sizga quyidagi imkoniyatlarni taqdim etadi:

🔹 Profil yaratish— Ismingiz, familiyangiz va telefon raqamingizni kiritib, profil yaratishingiz mumkin.  
🔹 Profilni ko'rish— O'z malumotlaringizni istalgan vaqtda ko'rishingiz mumkin.  
🔹 Malumotlarni tahrirlash— Istalgan vaqtda ism, familiya yoki telefon raqamni o'zgartirish imkoniyati.  
🔹 Bot yuborgan xabarlarni tozalash— Oldingi javoblarni o'chirish orqali interfeysni soddalashtirish.  
🔹 Yordam olish— Botdan foydalanish bo'yicha qisqa ko'rsatmalar.

📌 Boshlash uchun /startbuyrug'ini bosing.

📢 Botdan foydalanish uchun quyidagi kanallarga obuna bo'ling.
`.trim();
};
export const sendLongMessage = async (ctx: Context, text: string, chunkSize = 4000) => {
    for (let i = 0; i < text.length; i += chunkSize) {
        const part = text.slice(i, i + chunkSize);
        await ctx.reply(part);
    }
}


