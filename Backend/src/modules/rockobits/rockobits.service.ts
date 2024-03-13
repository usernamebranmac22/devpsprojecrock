import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as path from "path";
import { ROLES } from "src/constants";
import { TYPE_TRANSACTION } from "src/constants/typeTransaction.enum";
import { Employee } from "src/entities/employee.entity";
import { User } from "src/entities/user.entity";
import { EmailService } from "src/modules/email/email.service";
import { TransactionsService } from "src/modules/transactions/transactions.service";
import { WalletService } from "src/modules/wallet/wallet.service";
import { generateTransactionDescription } from "src/utils/genereateDescriptionTransaction";
import { Repository } from "typeorm";
import * as fs from "fs";
import { Multer } from "multer";

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

    const response = await this.walletService.transferRockobits(
      companyWallet.id,
      employeeWallet.id,
      amount
    );

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

    return response;
  }

  async transferToClient(body: any) {
    const { client_id, amount, company_id, type, voucher } = body;


    console.log(`${client_id} ${amount} ${company_id} ${type} ${voucher}`);
    const client = await this.userRepository.findOne({
      where: {
        id: parseInt(client_id),
      },
      relations: ["wallet"],
    });

    if (!client) {
      throw new HttpException("CLIENT_NOT_FOUND", 400);
    }
    let company;
    if (parseInt(type) === ROLES.EMPRESA) {
      console.log("object");
      company = await this.userRepository.findOne({
        where: {
          id: parseInt(company_id),
        },
        relations: ["wallet"],
      });

      console.log(company, "company");

      if (!company) {
        throw new HttpException("COMPANY_NOT_FOUND", 400);
      }
    }

    if (parseInt(type) === ROLES.EMPLEADOS) {
      console.log("object");
      company = await this.employeeRepository.findOne({
        where: {
          id: parseInt(company_id),
        },
        relations: ["wallet"],
      });

      if (!company) {
        throw new HttpException("EMPLOYEE_NOT_FOUND", 400);
      }
    }
    const companyWallet = company.wallet;
    const clientWallet = client.wallet;

    const response = await this.walletService.transferRockobits(
      companyWallet.id,
      clientWallet.id,
      amount
    );
    await this.transactionService.createForTransfer({
      idUser: parseInt(company_id),
      amount,
      type: TYPE_TRANSACTION.TRANSFERI,
      description: generateTransactionDescription(TYPE_TRANSACTION.TRANSFERI, {
        amount,
        clientName: client.name,
      }),
      voucher_url: voucher,
    });

    await this.transactionService.createForTransfer({
      idUser: client.id,
      amount,
      type: TYPE_TRANSACTION.RECIBO_CLIENTE,
      description: generateTransactionDescription(
        TYPE_TRANSACTION.RECIBO_CLIENTE,
        {
          amount,
          companyName: company.name,
        }
      ),
      voucher_url: voucher,
    });

    this.emailService.sendEmail(
      client.email,
      "Transferencia de Rockobits",
      `Te han transferido ${amount} rockobits de la empresa ${company.name}`
    );

    this.emailService.sendEmail(
      company.email,
      "Transferencia de Rockobits",
      `Has transferido ${amount} rockobits a la cuenta de ${client.name}`
    );

    return response;
  }
}
