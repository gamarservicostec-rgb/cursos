import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
      .replace(/\s+/g, "-") // espaços para hifens
      .replace(/-+/g, "-") // remove hifens duplicados
      .trim();
  }

  async create(createCourseDto: CreateCourseDto) {
    const slug = this.generateSlug(createCourseDto.title);

    // Verificar slug duplicado
    const existing = await this.prisma.course.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException("Já existe um curso com este título");
    }

    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        slug,
      },
    });
  }

  async findAll(status?: string) {
    const where = status ? { status: status as any } : {};
    return this.prisma.course.findMany({
      where,
      include: {
        _count: {
          select: { classes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        classes: {
          where: { status: "SCHEDULED" },
          orderBy: { startDate: "asc" },
        },
      },
    });

    if (!course) {
      throw new NotFoundException("Curso não encontrado");
    }

    return course;
  }

  async findById(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        classes: true,
      },
    });

    if (!course) {
      throw new NotFoundException("Curso não encontrado");
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    await this.findById(id);

    // Se o título mudou, atualizar slug
    const data: any = { ...updateCourseDto };
    if (updateCourseDto.title) {
      data.slug = this.generateSlug(updateCourseDto.title);

      // Verificar slug duplicado
      const existing = await this.prisma.course.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException("Já existe um curso com este título");
      }
    }

    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findById(id);
    return this.prisma.course.delete({ where: { id } });
  }
}
