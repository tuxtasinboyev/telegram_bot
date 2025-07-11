import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }
    async getAll() {
        const result = await this.prisma.user.findMany()
        return result
    }
    async getOne(id: string) {
        const result = await this.prisma.user.findUnique({ where: { telegramId: id } })
        return result
    }
    async userCount() {
        const result = await this.prisma.user.count()
        return `
          Sizning Obunachilariz soni:${result}
        `
    }
    async deleteUsers(id: string) {
        await this.prisma.user.delete({ where: { telegramId: id } })
        return await this.prisma.blockedUser.create({ data: { telegramId: id } })
    }
}