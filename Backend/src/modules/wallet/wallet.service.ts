import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Wallet } from "src/entities/wallet.entity";
import { FindOneOptions, Repository } from "typeorm";
import { CryptoService } from "../crypto/crypto.service";
import { Employee } from "src/entities/employee.entity";

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly cryptoService: CryptoService
  ) {}

  async createWalletForUser(user_id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
      });
      if (!user) {
        throw new HttpException("USER_NOT_FOUND", 400);
      }

      const initialAmount = 10000;
      const encryptedAmount = this.cryptoService.encrypt(
        initialAmount.toString()
      );
      const wallet = await this.walletRepository.create({
        amount: encryptedAmount,
        last_Update: new Date(),
        user: user,
      });

      return await this.walletRepository.save(wallet);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async createWalletForEmployee(employee_id: number) {
    try {
      const employee = await this.employeeRepository.findOne({
        where: {
          id: employee_id,
        },
      });
      if (!employee) {
        throw new HttpException("EMPLOYEE_NOT_FOUND", 400);
      }

      const initialAmount = 10;
      const encryptedAmount = this.cryptoService.encrypt(
        initialAmount.toString()
      );
      const wallet = await this.walletRepository.create({
        amount: encryptedAmount,
        last_Update: new Date(),
        employee: employee,
      });

      return await this.walletRepository.save(wallet);
    } catch (error) {
      console.log(error)
      throw new HttpException(error, 400);
    }
  }

  async getDecryptedAmount(walletId: any): Promise<string> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: {
          id: walletId,
        },
      });

      if (!wallet) {
        throw new HttpException("WALLET_NOT_FOUND", 400);
      }

      const decryptedAmount = this.cryptoService.decrypt(wallet.amount);
      return decryptedAmount;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async addAmount(walletId: any, amount: number): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: {
          id: walletId,
        },
      });
      if (!wallet) {
        throw new HttpException("WALLET_NOT_FOUND", 400);
      }

      const decryptedAmount = this.cryptoService.decrypt(wallet.amount);
      const newAmount = parseInt(decryptedAmount) + amount;
      const encryptedAmount = this.cryptoService.encrypt(newAmount.toString());

      wallet.amount = encryptedAmount;
      wallet.last_Update = new Date();

      return await this.walletRepository.save(wallet);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async updateNewAmount(walletId: any, newAmount: number): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: {
          id: walletId,
        },
      });
      if (!wallet) {
        throw new HttpException("WALLET_NOT_FOUND", 400);
      }

      const encryptedAmount = this.cryptoService.encrypt(newAmount.toString());
      wallet.amount = encryptedAmount;
      wallet.last_Update = new Date();

      return await this.walletRepository.save(wallet);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async getWalletBalanceByUserId(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ["wallet"],
    });

    const balance = await this.getDecryptedAmount(user.wallet.id);
    return {
      id: user.wallet.id,
      amount: balance,
      last_Update: user.wallet.last_Update,
    };
  }

  async transferRockobits(companyWalletId: number, employeeWalletId: number, amount: number) {
    try {
      const companyWallet = await this.walletRepository.findOne({
        where: {
          id: companyWalletId,
        },
      });
      const employeeWallet = await this.walletRepository.findOne({
        where: {
          id: employeeWalletId,
        },
      
      });

      // Verificar que ambos Wallets existan
      if (!companyWallet || !employeeWallet) {
        throw new HttpException("WALLET_NOT_FOUND", 400);
      }

      // Desencriptar los montos
      const companyAmount = parseInt(this.cryptoService.decrypt(companyWallet.amount));
      const employeeAmount = parseInt(this.cryptoService.decrypt(employeeWallet.amount));

      // Verificar que la empresa tenga suficientes rockobits para transferir
      if (companyAmount < amount) {
        throw new HttpException("INSUFFICIENT_FUNDS", 400);
      }

      // Actualizar los montos
      const newCompanyAmount = companyAmount - amount;
      const newEmployeeAmount = employeeAmount + amount;

      // Encriptar los nuevos montos
      const encryptedCompanyAmount = this.cryptoService.encrypt(newCompanyAmount.toString());
      const encryptedEmployeeAmount = this.cryptoService.encrypt(newEmployeeAmount.toString());

      // Actualizar los Wallets
      companyWallet.amount = encryptedCompanyAmount;
      employeeWallet.amount = encryptedEmployeeAmount;

      companyWallet.last_Update = new Date();
      employeeWallet.last_Update = new Date();

      await this.walletRepository.save([companyWallet, employeeWallet]);

      return {
        companyWalletId: companyWallet.id,
        employeeWalletId: employeeWallet.id,
        transferredAmount: amount,
      };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
  
}
