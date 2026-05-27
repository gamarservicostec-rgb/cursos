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

    const { modules, ...courseData } = createCourseDto;

    return this.prisma.$transaction(async (tx) => {
      return tx.course.create({
        data: {
          ...courseData,
          slug,
          modules: modules && Array.isArray(modules) ? {
            create: modules.map((mod, mIdx) => ({
              title: mod.title,
              description: mod.description || null,
              order: mod.order ?? mIdx,
              subjects: {
                create: (mod.subjects || []).map((sub, sIdx) => ({
                  title: sub.title,
                  description: sub.description || null,
                  order: sub.order ?? sIdx,
                  lessons: {
                    create: (sub.lessons || []).map((les, lIdx) => ({
                      title: les.title,
                      description: les.description || null,
                      type: les.type || "VIDEO",
                      videoUrl: les.videoUrl || null,
                      content: les.content || null,
                      duration: les.duration ? Number(les.duration) : null,
                      order: les.order ?? lIdx,
                    })),
                  },
                })),
              },
            })),
          } : undefined,
        },
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              subjects: {
                orderBy: { order: "asc" },
                include: {
                  lessons: {
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
          },
        },
      });
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
        modules: {
          orderBy: { order: "asc" },
          include: {
            subjects: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
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
        modules: {
          orderBy: { order: "asc" },
          include: {
            subjects: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException("Curso não encontrado");
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const existingCourse = await this.findById(id);

    const { modules, ...courseData } = updateCourseDto;
    const data: any = { ...courseData };

    if (updateCourseDto.title && updateCourseDto.title !== existingCourse.title) {
      data.slug = this.generateSlug(updateCourseDto.title);

      // Verificar slug duplicado
      const existing = await this.prisma.course.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException("Já existe um curso com este título");
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Se a grade curricular (modules) for enviada, limpar a antiga
      if (modules !== undefined && Array.isArray(modules)) {
        const oldModules = await tx.module.findMany({
          where: { courseId: id },
          select: { id: true },
        });
        const oldModuleIds = oldModules.map((m) => m.id);

        if (oldModuleIds.length > 0) {
          const oldSubjects = await tx.subject.findMany({
            where: { moduleId: { in: oldModuleIds } },
            select: { id: true },
          });
          const oldSubjectIds = oldSubjects.map((s) => s.id);

          if (oldSubjectIds.length > 0) {
            const oldLessons = await tx.lesson.findMany({
              where: { subjectId: { in: oldSubjectIds } },
              select: { id: true },
            });
            const oldLessonIds = oldLessons.map((l) => l.id);

            if (oldLessonIds.length > 0) {
              await tx.attendance.deleteMany({
                where: { lessonId: { in: oldLessonIds } },
              });
              await tx.lesson.deleteMany({
                where: { id: { in: oldLessonIds } },
              });
            }
            await tx.subject.deleteMany({
              where: { id: { in: oldSubjectIds } },
            });
          }
          await tx.module.deleteMany({
            where: { id: { in: oldModuleIds } },
          });
        }

        // Injetar os novos módulos via nested create na query de update do curso
        data.modules = {
          create: modules.map((mod, mIdx) => ({
            title: mod.title,
            description: mod.description || null,
            order: mod.order ?? mIdx,
            subjects: {
              create: (mod.subjects || []).map((sub, sIdx) => ({
                title: sub.title,
                description: sub.description || null,
                order: sub.order ?? sIdx,
                lessons: {
                  create: (sub.lessons || []).map((les, lIdx) => ({
                    title: les.title,
                    description: les.description || null,
                    type: les.type || "VIDEO",
                    videoUrl: les.videoUrl || null,
                    content: les.content || null,
                    duration: les.duration ? Number(les.duration) : null,
                    order: les.order ?? lIdx,
                  })),
                },
              })),
            },
          })),
        };
      }

      // 2. Atualizar informações básicas do curso e criar novos módulos de uma só vez!
      return tx.course.update({
        where: { id },
        data,
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              subjects: {
                orderBy: { order: "asc" },
                include: {
                  lessons: {
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
          },
        },
      });
    });
  }

  async remove(id: number) {
    const course = await this.findById(id);

    return this.prisma.$transaction(async (tx) => {
      // 1. Limpar toda a estrutura de módulos -> matérias -> aulas -> presenças
      const oldModules = await tx.module.findMany({
        where: { courseId: id },
        select: { id: true },
      });
      const oldModuleIds = oldModules.map((m) => m.id);

      if (oldModuleIds.length > 0) {
        const oldSubjects = await tx.subject.findMany({
          where: { moduleId: { in: oldModuleIds } },
          select: { id: true },
        });
        const oldSubjectIds = oldSubjects.map((s) => s.id);

        if (oldSubjectIds.length > 0) {
          const oldLessons = await tx.lesson.findMany({
            where: { subjectId: { in: oldSubjectIds } },
            select: { id: true },
          });
          const oldLessonIds = oldLessons.map((l) => l.id);

          if (oldLessonIds.length > 0) {
            await tx.attendance.deleteMany({
              where: { lessonId: { in: oldLessonIds } },
            });
            await tx.lesson.deleteMany({
              where: { id: { in: oldLessonIds } },
            });
          }
          await tx.subject.deleteMany({
            where: { id: { in: oldSubjectIds } },
          });
        }
        await tx.module.deleteMany({
          where: { id: { in: oldModuleIds } },
        });
      }

      // 2. Limpar turmas e inscrições
      const oldClasses = await tx.class.findMany({
        where: { courseId: id },
        select: { id: true },
      });
      const oldClassIds = oldClasses.map((c) => c.id);

      if (oldClassIds.length > 0) {
        await tx.payment.deleteMany({
          where: { enrollment: { classId: { in: oldClassIds } } },
        });
        await tx.enrollment.deleteMany({
          where: { classId: { in: oldClassIds } },
        });
        await tx.class.deleteMany({
          where: { id: { in: oldClassIds } },
        });
      }

      // 3. Deletar curso
      return tx.course.delete({ where: { id } });
    });
  }
}

