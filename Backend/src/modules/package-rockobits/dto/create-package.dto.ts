import { IsNumber, IsString } from "class-validator";

export class CreatePackageDto {
  @IsString({ message: "Invalid package name." })
  name: string;

  @IsString({ message: "Invalid currency." })
  currency: string;

  @IsNumber({}, { message: "Invalid amount." })
  amount: number;

  @IsNumber({}, { message: "Invalid price." })
  price: number;
}
