import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule],
  providers: [AdminService,UserService],
  exports: [AdminService,UserService]
})
export class AdminModule { }
