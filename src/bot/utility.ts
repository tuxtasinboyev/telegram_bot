import { User } from "@prisma/client";
import { Context } from "telegraf";
import * as CryptoJS from 'crypto-js';

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
                    { text: '🔍 search:' },
                    { text: '🎯 Signal olish' }
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
                    { text: '🛠  Edit  🛠' },
                    { text: '📚  Help  📚' },
                ],
                [
                    { text: '🎯 Signal olish' },
                    { text: '🧹  clear  🧹' },
                    { text: '🔍  search:  🔍' }
                ],
                [
                    { text: '/spam' },
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

export function generateProvablyFairMines(
    gridSize: number,
    mineCount: number,
    serverSeed: string,
    clientSeed: string,
    nonce: number
): { grid: string[][], hash: string } {
    const totalCells = gridSize * gridSize;
    const usedIndices = new Set<number>();
    const grid: string[][] = [];

    // 1. HMAC
    const message = `${clientSeed}:${nonce}`;
    const hmac = CryptoJS.HmacSHA256(message, serverSeed).toString(); // hex string

    // 2. Hash → Random indexlar ajratish
    let i = 0;
    while (usedIndices.size < mineCount && i < hmac.length - 8) {
        const hex = hmac.slice(i, i + 8); // 4 byte
        const num = parseInt(hex, 16);
        const index = num % totalCells;
        usedIndices.add(index);
        i += 8;
    }

    // 3. Grid yasash
    for (let r = 0; r < gridSize; r++) {
        grid[r] = [];
        for (let c = 0; c < gridSize; c++) {
            const idx = r * gridSize + c;
            grid[r][c] = usedIndices.has(idx) ? '❌' : '✅';
        }
    }

    return {
        grid,
        hash: hmac
    };
}
export function formatFairGridMessage(
    grid: string[][],
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    hash: string
): string {
    let msg = `🧠 <b>To‘liq Mines Signal (provably fair)</b>\n\n`;

    for (let row of grid) {
        msg += row.join(' ') + '\n';
    }

    msg += `\n🧾 HMAC: <code>${hash}</code>`;
    msg += `\n🔐 Tekshirish uchun:`;
    msg += `\nServerSeed: <code>${serverSeed}</code>`;
    msg += `\nClientSeed: <code>${clientSeed}</code>`;
    msg += `\nNonce: <code>${nonce}</code>`;
    msg += `\n✅ — xavfsiz | ❌ — mina`;

    return msg;
}



