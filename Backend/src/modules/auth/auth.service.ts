import { HttpException, Injectable } from "@nestjs/common";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { RegisterAuthDtoBase } from "./dto/register-auth.dto";
import { hash, compare } from "bcrypt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { NAME_MODEPLAY, ROLES, STATES } from "src/constants";
import { ModeplayService } from "../modeplay/modeplay.service";
import { WalletService } from "../wallet/wallet.service";
import { isValidDateFormat } from "../../utils/isValidDateFormat";
import { Logger } from "@nestjs/common";
import { EmailService } from "../email/email.service";
import { CountryService } from "../country/country.service";
import { Country } from "src/entities/country.entity";
import { State } from "src/entities/state.entity";
import { City } from "src/entities/city.entity";
import { ScreenService } from "../screen/screen.service";
const logger = new Logger("MyApp");

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly walletService: WalletService,
    private jwtAuthService: JwtService,
    private readonly emailService: EmailService,
    private readonly screenService: ScreenService,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>
  ) {}

  async register(userObjectRegister: RegisterAuthDtoBase) {
    try {
      const { password, email, type, ruc, birthDate } = userObjectRegister;
      if (type !== ROLES.EMPRESA) {
        if (!isValidDateFormat(birthDate)) {
          return new HttpException("DATE_FORMAT_IS_INVALID", 400);
        }
      }
      if (!email) throw new HttpException("EMAIL_IS_REQUIRED", 400);
      if (!password) throw new HttpException("PASSWORD_IS_REQUIRED", 400);

      //Validate country,state and city.
      const country = await this.countryRepository.findOne({
        where: { id: userObjectRegister.countryId },
      });
      if (!country) throw new HttpException("COUNTRY_NOT_FOUND", 404);

      const state = await this.stateRepository.findOne({
        where: { id: userObjectRegister.stateId },
      });
      if (!state) throw new HttpException("STATE_NOT_FOUND", 404);

      const city = await this.cityRepository.findOne({
        where: { id: userObjectRegister.cityId },
      });
      if (!city) throw new HttpException("CITY_NOT_FOUND", 404);

      const plaintoHash = await hash(password, 10);
      userObjectRegister = { ...userObjectRegister, password: plaintoHash };
      const userFound = await this.userRepository.findOne({
        where: {
          email,
        },
      });
      if (userFound) throw new HttpException("USER_EXIST", 400);
      let user: User;
      if (type === ROLES.EMPRESA && !ruc) {
        throw new HttpException("RUC_REQUIRED_FOR_COMPANY", 400);
      }

      if (type === ROLES.EMPRESA || type === ROLES.CLIENTE) {
        let userPayload: any = {
          name: userObjectRegister.name,
          email: userObjectRegister.email,
          pass_word: plaintoHash,
          country: userObjectRegister.countryId,
          state: userObjectRegister.stateId,
          city: userObjectRegister.cityId,
          address: userObjectRegister.address,
          type: type,
          logo: userObjectRegister.logo,
          phone: userObjectRegister.phone,
          postalCode: userObjectRegister.postalCode,
        };

        if (type === ROLES.EMPRESA) {
          userPayload.ruc = userObjectRegister.ruc;
        } else {
          userPayload.last_Name = userObjectRegister.lastName;
          userPayload.birth_Date = userObjectRegister.birthDate;
        }
        user = await this.userRepository.save(userPayload);

        if (type === ROLES.EMPRESA) {
          await this.screenService.createDefaultScreen(user);
        }
        
        const wallet = await this.walletService.createWalletForUser(user.id);
        user.wallet = wallet;
        await this.userRepository.save(user);
      }

      if (
        type === ROLES.SUPERADMIN ||
        type === ROLES.ADMIN ||
        type === ROLES.EMPLEADOS
      ) {
        let userPayload: any = {
          name: userObjectRegister.name,
          email: userObjectRegister.email,
          pass_word: plaintoHash,
          country: userObjectRegister.countryId,
          state: userObjectRegister.stateId,
          city: userObjectRegister.cityId,
          address: userObjectRegister.address,
          type: type,
          logo: userObjectRegister.logo,
          phone: userObjectRegister.phone,
          postalCode: userObjectRegister.postalCode,
        };
        user = await this.userRepository.save(userPayload);
      }

      if (type === ROLES.CLIENTE) {
        const verificationCode = this.generateVerificationCode();
        await this.emailService.sendEmail(
          email,
          "Verificacion de Cuenta",
          `<div><h1>Tu codigo de verificacion para tu cuenta es: ${verificationCode} </h1></div>`
        );

        user.verificationCode = verificationCode;
        await this.userRepository.save(user);
      }

      // Delete password and wallet from response for security
      delete user.pass_word;
      delete user.wallet;
      return {
        message: "ok",
        data: {
          user,
        },
      };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  private generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async login(userObjectLogin: LoginAuthDto, type: string) {
    try {
      const { email, password } = userObjectLogin;
      const findUser = await this.userRepository.findOne({
        where: { email },
        relations: ["country", "activeMembership"],
      });
      if (!findUser) {
        throw new HttpException("USER_NOT_FOUND", 404);
      }

      // Validar el tipo de usuario en el login
      const validRoles: Record<string, number[]> = {
        companies: [ROLES.EMPRESA, ROLES.EMPLEADOS],
        clients: [ROLES.CLIENTE],
        admins: [ROLES.SUPERADMIN, ROLES.ADMIN],
      };

      const allowedRoles = validRoles[type];
      if (!allowedRoles) {
        throw new HttpException("INVALID_LOGIN_TYPE", 400);
      }
      if (!this.isLoginForType(findUser, allowedRoles)) {
        throw new HttpException("ACCESS_DENIED", 403);
      }

      // Si el usuario es un administrador, validar el adminCode
      if (
        allowedRoles.includes(ROLES.ADMIN) ||
        allowedRoles.includes(ROLES.SUPERADMIN)
      ) {
        if (
          !userObjectLogin.adminCode ||
          userObjectLogin.adminCode !== findUser.adminCode
        ) {
          throw new HttpException("INVALID_ADMIN_CODE", 403);
        }
      }

      /* if (allowedRoles.includes(ROLES.EMPRESA)) {
        if (
          !userObjectLogin.adminCode ||
          userObjectLogin.adminCode !== findUser.adminCode
        ) {
          throw new HttpException("INVALID_COMPANY_CODE", 403);
        }
      }*/

      // Validate user state only for clients, companies and employees
      if (
        [ROLES.EMPRESA, ROLES.CLIENTE, ROLES.EMPLEADOS].includes(
          findUser.type
        ) &&
        findUser.state_User !== STATES.ACTIVO
      ) {
        throw new HttpException("USER_IS_NOT_ACTIVE", 400);
      }

      // Check password
      const checkPassword = await compare(password, findUser.pass_word);
      if (!checkPassword) {
        throw new HttpException("PASSWORD_INCORRECT", 403);
      }

      // Generate token
      const payload = {
        id: findUser.id,
        name: findUser.name,
        countryId: findUser.country.id,
      };

      const token = this.jwtAuthService.sign(payload, { expiresIn: "1h" });
      const tokenExpiration = new Date(
        new Date().getTime() + 1 * 60 * 60 * 1000
      );
      //
      findUser.adminCode = null;
      await this.userRepository.save(findUser);

      // Response login data
      const data = {
        user: {
          id: findUser.id,
          name: findUser.name,
          lastName: findUser.last_Name,
          email: findUser.email,
          type: findUser.type,
          membership: {
            name: findUser.activeMembership?.name,
            type: findUser.activeMembership?.type,
            expiration: findUser.membershipExpirationDate,
          },
        },
        token,
        tokenExpiration,
      };

      return data;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  private isLoginForType(user: User, validRoles: number[]): boolean {
    return validRoles.includes(user.type);
  }

  async verifyAccountUser(id: number, code: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) return new HttpException("USER_NOT_FOUND", 404);

      if (user.type !== ROLES.CLIENTE) {
        return new HttpException("USER_IS_NOT_A_CLIENT_TYPE", 400);
      }
      if (user.state_User === STATES.ACTIVO) {
        return new HttpException("USER_ALREADY_VERIFIED", 400);
      }
      if (user.verificationCode !== code)
        return new HttpException("CODE_INCORRECT", 400);

      if (user && user.verificationCode === code) {
        await this.userRepository.update(user.id, {
          state_User: STATES.ACTIVO,
        });
        return { message: "ok", data: "Email verification successfully" };
      }
    } catch (error) {
      return new HttpException("SERVER_ERROR", 500);
    }
  }

  async resendCode(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return new HttpException("USER_NOT_FOUND", 404);
    if (user.type !== ROLES.CLIENTE)
      return new HttpException("USER_IS_NOT_A_CLIENT_TYPE", 400);
    if (user.state_User === STATES.ACTIVO)
      return new HttpException("USER_ALREADY_VERIFIED", 400);

    await this.emailService.sendEmail(
      user.email,
      "Verificacion de Cuenta - Reenvio de codigo",
      `<div><h1>Tu codigo de verificacion para tu cuenta es: ${user.verificationCode} </h1></div>`
    );

    return {
      message: "ok",
      data: "Code resend successfully",
    };
  }

  async sendCodeAdmin(body: any) {
    const { email } = body;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new HttpException("USER_NOT_FOUND", 404);
    if (user.type !== ROLES.ADMIN && user.type !== ROLES.SUPERADMIN)
      throw new HttpException("USER_IS_NOT_A_ADMIN_TYPE", 400);

    const code = this.generateVerificationCode();
    await this.emailService.sendEmail(
      email,
      "Verificacion de Cuenta - Administrador ",
      `<div><h1>Tu codigo de verificacion para tu cuenta es: ${code} </h1></div>`
    );

    user.adminCode = code;
    await this.userRepository.save(user);

    return {
      message: "ok",
      data: "Code admin send successfully",
    };
  }

  async sendCodeCompany(body: any) {
    const { email } = body;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new HttpException("USER_NOT_FOUND", 404);
    if (user.type !== ROLES.EMPRESA)
      throw new HttpException("USER_IS_NOT_COMPANY", 400);

    const code = this.generateVerificationCode();
    await this.emailService.sendEmail(
      email,
      "Verificacion de Cuenta - Empresas ",
      `<div><h1>Tu codigo de verificacion para tu cuenta es: ${code} </h1></div>`
    );

    user.adminCode = code;
    await this.userRepository.save(user);

    return {
      message: "ok",
      data: "Code company send successfully",
    };
  }
}
