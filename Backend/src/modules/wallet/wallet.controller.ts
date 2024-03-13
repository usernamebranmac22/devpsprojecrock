import { Controller, Get, Param, Query } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { FindManyOptions } from "typeorm";

@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(":walletId/amount")
  async getDecryptedAmount(@Param("walletId") walletId: FindManyOptions) {
    const decryptedAmount =
      await this.walletService.getDecryptedAmount(walletId);
    return { message: "ok", data: { decryptedAmount } };
  }

  @Get(":userId")
  async getWalletBalanceByUserId(@Param("userId") userId: number) {
    const wallet = await this.walletService.getWalletBalanceByUserId(userId);
    return { message: "ok", data: wallet };
  }
}
