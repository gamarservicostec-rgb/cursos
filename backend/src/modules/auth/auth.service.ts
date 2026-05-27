import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../common/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email já cadastrado");
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        cpf: registerDto.cpf,
      },
    });

    // Gerar token
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    // Verificar status
    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException("Conta inativa ou bloqueada");
    }

    // Gerar token
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado");
    }

    return user;
  }
}
