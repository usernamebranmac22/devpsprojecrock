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
      const screen = await this.screenService.getScreenByCode(
        createQuotationPlayDto.codeScreen
      );

      if (!screen) throw new HttpException("SCREEN_NOT_FOUND", 404);
      const company = screen.company;
      if (!company) throw new HttpException("COMPANY_NOT_FOUND", 404);

      const modeplays = await this.modeplayService.findAll();
      const idVideos = createQuotationPlayDto.idVideos.split(",");
      const durations = createQuotationPlayDto.durations.split(",");

      const prices = await Promise.all(
        idVideos.map(async (idVideo, index) => {
          try {
            const duration = parseInt(durations[index]);

            const price = calculatePriceByDuration(duration);
            return {
              VIDEO: {
                id: idVideo,
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

      //! Devolverá el saldo que el cliente podrá gastar en el establecimiento (rockobits).
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
