import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Screen } from "src/entities/screen.entity";
import { CreateScreenDto } from "./dto/create-screen.dto";
import { User } from "src/entities/user.entity";
import { ROLES } from "src/constants";
import { EditScreenDto } from "./dto/edit-screen.dto";
import { randomBytes } from "crypto";

@Injectable()
export class ScreenService {
  constructor(
    @InjectRepository(Screen)
    private readonly screenRepository: Repository<Screen>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findAll() {
    const screens = await this.screenRepository.find();
    if (!screens) {
      throw new HttpException("Not found", 404);
    }
    return screens;
  }

  async getAllScreensByCompany(companyId: number): Promise<Screen[]> {
    return this.screenRepository.find({
      where: { company: { id: companyId } },
    });
  }

  async getScreenById(id: number): Promise<Screen> {
    console.log("id", id);
    const screen = await this.screenRepository.findOne({
      where: { id },
      relations: ["company"],
    });
    if (!screen) {
      throw new HttpException("SCREEN_NOT_FOUND", 404);
    }
    return screen;
  }

  async createScreen(objectCreate: CreateScreenDto) {
    const { idCompany, name, password } = objectCreate;

    const company = await this.userRepository.findOne({
      where: { id: idCompany },
    });

    if (!company) {
      throw new HttpException("COMPANY_NOT_FOUND", 404);
    }
    if (company.type !== ROLES.EMPRESA) {
      throw new HttpException("USER_NOT_COMPANY", 403);
    }

    // if (!company.activeMembership) {
    //   throw new HttpException("NO_MEMBERSHIP_ACTIVE", 403);
    // }

    // Se debe realizar la validacion de que, si la empresa tiene un limite de pantallas y
    // ya llego a ese limite, no se le permita crear mas pantallas

    const screen = new Screen();
    screen.name = name;
    screen.password = password;
    screen.company = company;
    screen.active = true;
    screen.code = await this.generateUniqueCode();

    await this.screenRepository.save(screen);

    return screen;
  }
  private async generateUniqueCode(
    attempts = 0,
    maxAttempts = 10
  ): Promise<string> {
    if (attempts >= maxAttempts) {
      throw new Error(
        "No se pudo generar un código único después de varios intentos."
      );
    }

    const randomBytesBuffer = randomBytes(3);
    const threeDigitCode = randomBytesBuffer
      .toString("hex")
      .toUpperCase()
      .slice(0, 4);

    const code = `S${threeDigitCode}`;

    // Verificar si el código ya existe en la base de datos
    const existingScreen = await this.screenRepository.findOne({
      where: { code: code },
    });

    if (existingScreen) {
      // Si el código ya existe, intentar generar uno nuevo recursivamente
      return this.generateUniqueCode(attempts + 1, maxAttempts);
    }

    return code;
  }

  async editScreen(id: number, editScreenDto: EditScreenDto) {
    const screen = await this.screenRepository.findOne({ where: { id } });

    if (!screen) {
      throw new HttpException("SCREEN_NOT_FOUND", 404);
    }

    if (editScreenDto.name !== undefined) {
      screen.name = editScreenDto.name;
    }

    if (editScreenDto.code !== undefined) {
      screen.code = editScreenDto.code;
    }

    if (editScreenDto.active !== undefined) {
      screen.active = editScreenDto.active;
    }

    // Guardar los cambios en la base de datos
    await this.screenRepository.save(screen);

    return screen;
  }

  async createDefaultScreen(user: User) {
    const screen = new Screen();
    screen.name = user.name + " Screen";
    screen.password = "1234";
    screen.company = user;
    screen.active = true;
    screen.default = true;
    screen.code = await this.generateUniqueCode();
    await this.screenRepository.save(screen);

    return screen;
  }
}
