import { IsNumber, IsString } from "class-validator";

export class CalculatePriceDto {
  @IsString()
  idVideo: string;

  @IsNumber()
  idScreen: number;
}
