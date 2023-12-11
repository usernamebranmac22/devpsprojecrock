import { Module } from '@nestjs/common';
import { ConfirmPayUserService } from './confirm_pay_user.service';
import { ConfirmPayUserController } from './confirm_pay_user.controller';
import { YoutubeModule } from '../youtube/youtube.module';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModeplayModule } from '../modeplay/modeplay.module';
import { QuotationPlayModule } from '../quotation_play/quotation_play.module';
import { PlayListCompanyModule } from '../play_list_company/play_list_company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    YoutubeModule,
    ModeplayModule,
    QuotationPlayModule,
    PlayListCompanyModule
  ],
  controllers: [ConfirmPayUserController],
  providers: [ConfirmPayUserService]
})
export class ConfirmPayUserModule {}
