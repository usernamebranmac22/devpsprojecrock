import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TYPE_TRANSACTION } from "src/constants/typeTransaction.enum";

export class CreateTransactionDto {
  @IsNumber()
  idUser: number;

  @IsNumber()
  amount: number;

  @IsEnum(TYPE_TRANSACTION)
  type: TYPE_TRANSACTION;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  voucher_url?: string;
}
