import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../common/prisma.service";
import { CheckInDto } from "./dto/check-in.dto";

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async checkIn(userId: number, checkInDto: CheckInDto) {
    const { lessonId, presenceToken } = checkInDto;

    // 1. Verificar se a aula (lesson) existe
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException("Aula não encontrada");
    }

    let localNodeId: number;

    // Se for o token de simulação, obter o primeiro nó local semeado
    if (presenceToken === "token_simulado_unidade_centro") {
      const node = await this.prisma.localNode.findFirst({
        where: { isActive: true },
      });
      if (!node) {
        throw new BadRequestException("Nenhuma unidade física ativa cadastrada");
      }
      localNodeId = node.id;
    } else {
      // 2. Decodificar o token para ler o ID da Unidade Física (Local Node)
      let decoded: any;
      try {
        decoded = this.jwtService.decode(presenceToken);
      } catch (err) {
        throw new BadRequestException("Token de presença malformado ou inválido");
      }

      if (!decoded || !decoded.localNodeId) {
        throw new BadRequestException("Token de presença inválido");
      }

      localNodeId = decoded.localNodeId;

      // 3. Buscar a unidade física (Local Node) correspondente
      const localNode = await this.prisma.localNode.findUnique({
        where: { id: localNodeId },
      });
      if (!localNode || !localNode.isActive) {
        throw new BadRequestException("Unidade física inativa ou não cadastrada");
      }

      // 4. Validar assinatura do Token usando a chave secreta daquela unidade
      try {
        this.jwtService.verify(presenceToken, {
          secret: localNode.secretKey,
        });
      } catch (err) {
        throw new BadRequestException("Token de presença expirado ou assinatura inválida");
      }
    }

    // 5. Verificar se o aluno já marcou presença para esta aula
    const existing = await this.prisma.attendance.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    if (existing) {
      throw new ConflictException("Presença já registrada para esta aula");
    }

    // 6. Criar registro de presença
    return this.prisma.attendance.create({
      data: {
        userId,
        lessonId,
        localNodeId,
        isValid: true,
      },
      include: {
        lesson: {
          select: { id: true, title: true },
        },
        localNode: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async getMyAttendances(userId: number) {
    return this.prisma.attendance.findMany({
      where: { userId },
      include: {
        lesson: true,
        localNode: true,
      },
      orderBy: { checkInAt: "desc" },
    });
  }
}
