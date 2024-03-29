import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { PlayListCompanyService } from "./play_list_company.service";
import { UpdatePlayListCompanyDto } from "./dto/update-play_list_company.dto";
import { QueryPlayListDto } from "./dto/query-playlist.dto";

@Controller("play-list-company")
export class PlayListCompanyController {
  constructor(
    private readonly playListCompanyService: PlayListCompanyService
  ) {}

  @Get(":codeScreen")
  findByCodeScreen(
    @Param("codeScreen") codeScreen: string,
    @Query() query: QueryPlayListDto
  ) {
    return this.playListCompanyService.findByCodeScreen(codeScreen, query);
  }

  @Get("/company/:idCompany")
  findByCompany(
    @Param("idCompany") idCompany: number,
    @Query() query: QueryPlayListDto
  ) {
    return this.playListCompanyService.findByIdCompany(idCompany, query);
  }

  @Patch(":idPlaylist")
  update(
    @Param("idPlaylist", ParseIntPipe) idPlaylist: string,
    @Body() updatePlayListCompanyDto: UpdatePlayListCompanyDto
  ) {
    return this.playListCompanyService.update(
      +idPlaylist,
      updatePlayListCompanyDto
    );
  }

  @Get('/test/:videoId')
  async getVideoFileUrl(@Param('videoId') videoId: string): Promise<{ url: string }> {
    try {
      const url = await this.playListCompanyService.getVideoFileUrl(videoId);
      return { url };
    } catch (error) {
      // Maneja el error y devuelve una respuesta apropiada
    }
  }
}
