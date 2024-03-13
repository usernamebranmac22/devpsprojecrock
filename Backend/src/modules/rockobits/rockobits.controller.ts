import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { RockobitsService } from "./rockobits.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from "multer";
import axios from "axios";

@Controller("rockobits")
export class RockobitsController {
  constructor(private readonly rockobitsService: RockobitsService) {}

  @Post("transferCompanyToEmployee")
  transferCompanyToEmployee(@Body() body: any) {
    return this.rockobitsService.transferCompanyToEmployee(body);
  }

  @Post("transferToClient")
  @UseInterceptors(FileInterceptor("voucher")) // 'voucher' es el nombre del campo del archivo en el formulario
  async transferToClient(@Body() body: any, @UploadedFile() file: Multer.File) {
    const { client_id, amount, company_id, type, paymentMethod } = body;

    try {
      let response;
      if (paymentMethod === "transfer") {
        const blob = new Blob([file.buffer], { type: file.mimetype });

        const formData = new FormData();
        formData.append("archivo", blob, file.originalname);
        response = await axios.post(
          "http://resources.path.ps.psrockola.com/upload_resouce.php",
          formData
        );
      }

      return this.rockobitsService.transferToClient({
        client_id,
        amount,
        company_id,
        type,
        voucher:
          paymentMethod === "transfer" ? response.data.url_archivo : null,
      });
    } catch (error) {
      // Manejar errores si la solicitud falla
      console.error("Error en la solicitud al servidor externo:", error);
      throw new HttpException(
        "Error en la solicitud al servidor externo",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
