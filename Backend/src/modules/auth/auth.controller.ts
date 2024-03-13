import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { RegisterAuthDtoBase } from "./dto/register-auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Register para todos los tipos de usuario
  @Post("register")
  registerUser(@Body() userObjetRegister: RegisterAuthDtoBase) {
    return this.authService.register(userObjetRegister);
  }

  // Login para todos los tipos de usuarios. (menos empleado)
  @Post("login/:type")
  loginUser(@Body() userObjetLogin: LoginAuthDto, @Param("type") type: string) {
    return this.authService.login(userObjetLogin, type);
  }
  // Login para empleados
  @Post("login-employee")
  loginEmployee(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.loginEmployee(loginAuthDto);
  }



  // Este endpoint es para verificar la cuenta de los usuarios de tipo cliente.
  @Get("verify-account")
  async verifyAccountUser(
    @Query("id") id: number,
    @Query("code") code: string
  ) {
    return this.authService.verifyAccountUser(id, code);
  }

  // Este endpoint es para reenviar el codigo de verificacion de los usuarios de tipo cliente.
  @Get("resend-code/:id")
  async resendCode(@Param("id") id: number) {
    return this.authService.resendCode(id);
  }

  @Post("send-code-admin")
  async sendCodeAdmin(@Body() body: any) {
    return this.authService.sendCodeAdmin(body);
  }
  @Post("send-code-company")
  async sendCodeCompany(@Body() body: any) {
    return this.authService.sendCodeCompany(body);
  }
}
