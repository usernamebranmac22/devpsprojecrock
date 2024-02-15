import { HttpException, Injectable } from "@nestjs/common";
import { CalculatePriceDto } from "./dto/create-quotation_play.dto";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { YoutubeService } from "../youtube/youtube.service";
import {
  COST_MODEPLAY,
  MODEPLAY,
  NAME_MODEPLAY,
} from "src/constants/modePlay.enum";
import { ROLES } from "src/constants";
import { ModeplayService } from "../modeplay/modeplay.service";
import convertMilisecondsToTime from "src/utils/convertMilisecondsToTime";
import calculatePriceByDuration from "src/utils/calculatePriceByDuration";
import { ScreenService } from "../screen/screen.service";
import { title } from "process";

@Injectable()
export class QuotationPlayService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly youtubeService: YoutubeService,
    private readonly modeplayService: ModeplayService,
    private readonly screenService: ScreenService
  ) {}

  async calculatePrice(createQuotationPlayDto: CalculatePriceDto) {
    try {
      const screen = await this.screenService.getScreenById(
        createQuotationPlayDto.idScreen
      );

      if (!screen) throw new HttpException("SCREEN_NOT_FOUND", 404);
      const company = screen.company;
      if (!company) throw new HttpException("COMPANY_NOT_FOUND", 404);

      const modeplays = await this.modeplayService.findAll();
      const idVideos = createQuotationPlayDto.idVideo.split(",");

      const prices = await Promise.all(
        idVideos.map(async (idVideo) => {
          try {
            const duration = await this.youtubeService.getDuration(idVideo);
            const videoDetails =
              await this.youtubeService.getVideoDetails(idVideo);

            const price = calculatePriceByDuration(duration);
            return {
              VIDEO: {
                details: {
                  id: idVideo,
                  thumbnails: {
                    default: videoDetails.snippet.thumbnails.default.url,
                    medium: videoDetails.snippet.thumbnails.medium.url,
                    high: videoDetails.snippet.thumbnails.high.url,
                  },
                  chanelTitle: videoDetails.snippet.channelTitle,
                  title: videoDetails.snippet.title,
                },
                costs: {
                  [NAME_MODEPLAY.PLATINUM]: {
                    price: price * COST_MODEPLAY.PLATINUM,
                
                    type: MODEPLAY.PLATINUM,
                  },
                  [NAME_MODEPLAY.VIP]: {
                    price: price * COST_MODEPLAY.VIP,
                    type: MODEPLAY.VIP,
                  },
                  [NAME_MODEPLAY.NORMAL]: {
                    price: price * COST_MODEPLAY.NORMAL,
                    type: MODEPLAY.NORMAL,
                  },
                },
                duration: convertMilisecondsToTime(duration),
              },
            };
          } catch (error) {
            console.error(
              `Error al procesar el video con ID ${idVideo}:`,
              error
            );
            return null;
          }
        })
      );

      return {
        message: "Ok",
        data: {
          prices,
          company,
        },
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 400);
    }
  }
}
