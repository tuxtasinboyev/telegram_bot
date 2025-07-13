import { Module } from '@nestjs/common';
import { ShazamService } from './shazam.service';

@Module({
  providers: [ShazamService],
  exports:[ShazamService]
})
export class ShazamModule {}
