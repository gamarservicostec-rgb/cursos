import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: createEnrollmentDto.userId },
    });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    // Verificar se a turma existe
    const classItem = await this.prisma.class.findUnique({
      where: { id: createEnrollmentDto.classId },
      include: {
        _count: { select: { enrollments: true } },
      },
    });
    if (!classItem) {
      throw new NotFoundException("Turma não encontrada");
    }

    // Verificar vagas
    if (classItem._count.enrollments >= classItem.maxStudents) {
      throw new BadRequestException("Turma sem vagas disponíveis");
    }

    // Verificar duplicidade
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId: createEnrollmentDto.userId,
          classId: createEnrollmentDto.classId,
        },
      },
    });
    if (existingEnrollment) {
      throw new ConflictException("Aluno já matriculado nesta turma");
    }

    return this.prisma.enrollment.create({
      data: createEnrollmentDto,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        class: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });
  }

  async findAll(status?: string) {
    const where = status ? { status: status as any } : {};
    return this.prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        class: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        class: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  async findById(id: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        class: {
          include: { course: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException("Matrícula não encontrada");
    }

    return enrollment;
  }

  async updateStatus(id: number, status: string) {
    await this.findById(id);
    return this.prisma.enrollment.update({
      where: { id },
      data: { status: status as any },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        class: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findById(id);
    return this.prisma.enrollment.delete({ where: { id } });
  }
}
