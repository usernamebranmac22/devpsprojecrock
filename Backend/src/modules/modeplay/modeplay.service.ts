import { HttpException, Injectable } from "@nestjs/common";
import { CreateModeplayDto } from "./dto/create-modeplay.dto";
import { UpdateModeplayDto } from "./dto/update-modeplay.dto";
import { ModePlay } from "src/entities/modePlay.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MODEPLAY } from "src/constants";
import { COST_MODEPLAY } from "src/constants/modePlay.enum";

@Injectable()
export class ModeplayService {
  constructor(
    @InjectRepository(ModePlay)
    private readonly modePlayRepository: Repository<ModePlay>
  ) {}

  create(createModeplayDto: CreateModeplayDto) {
    const { title, type, value } = createModeplayDto;

    const modePlayFound = this.modePlayRepository.findOne({
      where: { title },
    });

    if (modePlayFound) {
      throw new HttpException("MODE_PLAY_EXIST", 400);
    }
    return this.modePlayRepository.save({
      title,
      type,
      value,
    });
  }

  //Buscar todos los modePlays
  findAll() {
    return `This action returns all modeplay`;
  }

  //Buscar un modePlay por id
  async findOne(type: number) {
    const modePlay = await this.modePlayRepository.findOne({
      where: { type },
    });
    if (!modePlay) {
      throw new HttpException("MODE_PLAY_NOT_FOUND", 404);
    }
    return modePlay;
  }
}
