import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    // Verificar se o curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: createClassDto.courseId },
    });

    if (!course) {
      throw new NotFoundException("Curso não encontrado");
    }

    // Validar datas
    const startDate = new Date(createClassDto.startDate);
    const endDate = new Date(createClassDto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException(
        "Data de término deve ser posterior à data de início",
      );
    }

    return this.prisma.class.create({
      data: {
        ...createClassDto,
        startDate,
        endDate,
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  }

  async findAll(courseId?: number) {
    const where = courseId ? { courseId } : {};
    return this.prisma.class.findMany({
      where,
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { startDate: "asc" },
    });
  }

  async findById(id: number) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: {
        course: true,
        enrollments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!classItem) {
      throw new NotFoundException("Turma não encontrada");
    }

    return classItem;
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    await this.findById(id);

    const data: any = { ...updateClassDto };
    if (updateClassDto.startDate)
      data.startDate = new Date(updateClassDto.startDate);
    if (updateClassDto.endDate) data.endDate = new Date(updateClassDto.endDate);

    return this.prisma.class.update({
      where: { id },
      data,
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findById(id);
    return this.prisma.class.delete({ where: { id } });
  }
}
