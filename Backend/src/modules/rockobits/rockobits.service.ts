import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TYPE_TRANSACTION } from "src/constants/typeTransaction.enum";
import { Employee } from "src/entities/employee.entity";
import { User } from "src/entities/user.entity";
import { EmailService } from "src/modules/email/email.service";
import { TransactionsService } from "src/modules/transactions/transactions.service";
import { WalletService } from "src/modules/wallet/wallet.service";
import { generateTransactionDescription } from "src/utils/genereateDescriptionTransaction";
import { Repository } from "typeorm";

@Injectable()
export class RockobitsService {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionsService,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService
  ) {}

  async transferCompanyToEmployee(body: any) {
    const { employee_id, amount, company_id } = body;

    const employee = await this.employeeRepository.findOne({
      where: {
        id: employee_id,
      },
      relations: ["wallet"],
    });
    if (!employee) {
      throw new HttpException("EMPLOYEE_NOT_FOUND", 400);
    }

    const company = await this.userRepository.findOne({
      where: {
        id: company_id,
      },
      relations: ["wallet"],
    });

    if (!company) {
      throw new HttpException("COMPANY_NOT_FOUND", 400);
    }

    const companyWallet = company.wallet;
    const employeeWallet = employee.wallet;

    await this.transactionService.createForTransfer({
      idUser: company.id,
      amount,
      type: TYPE_TRANSACTION.TRANSFERI_EMPLEADO,
      description: generateTransactionDescription(
        TYPE_TRANSACTION.TRANSFERI_EMPLEADO,
        {
          amount,
          clientName: employee.name,
        }
      ),
    });

    await this.transactionService.createForTransfer({
      idUser: employee.id,
      amount,
      type: TYPE_TRANSACTION.RECIBO_EMPLEADO,
      description: generateTransactionDescription(
        TYPE_TRANSACTION.RECIBO_EMPLEADO,
        {
          amount,
          companyName: company.name,
        }
      ),
    });

    this.emailService.sendEmail(
      employee.email,
      "Transferencia de Rockobits",
      `Te han transferido ${amount} rockobits de la empresa ${company.name}`
    );

    this.emailService.sendEmail(
      company.email,
      "Transferencia de Rockobits",
      `Has transferido ${amount} rockobits a la cuenta de ${employee.name}`
    );

    const response = await this.walletService.transferRockobits(
      companyWallet.id,
      employeeWallet.id,
      amount
    );
    return response;
  }
}
