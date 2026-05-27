import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    // Verificar se o curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: createLessonDto.courseId },
    });

    if (!course) {
      throw new NotFoundException("Curso não encontrado");
    }

    // Se não foi informada a ordem, definir como o último
    if (createLessonDto.order === undefined) {
      const lastLesson = await this.prisma.lesson.findFirst({
        where: { courseId: createLessonDto.courseId },
        orderBy: { order: "desc" },
      });
      createLessonDto.order = lastLesson ? lastLesson.order + 1 : 0;
    }

    return this.prisma.lesson.create({
      data: createLessonDto,
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  }

  async findAll(courseId?: number) {
    const where = courseId ? { courseId } : {};
    return this.prisma.lesson.findMany({
      where,
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: [{ courseId: "asc" }, { order: "asc" }],
    });
  }

  async findById(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException("Aula não encontrada");
    }

    return lesson;
  }

  async findByCourse(courseId: number) {
    // Verificar se o curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException("Curso não encontrado");
    }

    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    await this.findById(id);

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findById(id);
    return this.prisma.lesson.delete({ where: { id } });
  }

  async reorder(courseId: number, lessonIds: number[]) {
    // Verificar se o curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException("Curso não encontrado");
    }

    // Atualizar a ordem de cada aula
    const updates = lessonIds.map((lessonId, index) =>
      this.prisma.lesson.update({
        where: { id: lessonId },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findByCourse(courseId);
  }
}
