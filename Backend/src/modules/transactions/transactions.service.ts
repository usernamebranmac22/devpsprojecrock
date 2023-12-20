import { HttpException, Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "src/entities/transactions.entity";
import { Repository } from "typeorm";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    try {
      const { idUser, amount, type } = createTransactionDto;

      const transaction = await this.transactionsRepository.save({
        r_id_User: idUser,
        r_amount: amount,
        r_type_T: type,
      });

      return {
        id: transaction.r_id,
        idUser: transaction.r_id_User,
        amount: transaction.r_amount,
        type: transaction.r_type_T,
        date: transaction.createdAt,
      };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
