import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { LessonsService } from "./lessons.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("lessons")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  findAll(@Query("courseId") courseId?: string) {
    return this.lessonsService.findAll(
      courseId ? parseInt(courseId, 10) : undefined,
    );
  }

  @Get(":id")
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.lessonsService.findById(id);
  }

  @Get("course/:courseId")
  findByCourse(@Param("courseId", ParseIntPipe) courseId: number) {
    return this.lessonsService.findByCourse(courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.lessonsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("course/:courseId/reorder")
  reorder(
    @Param("courseId", ParseIntPipe) courseId: number,
    @Body("lessonIds") lessonIds: number[],
  ) {
    return this.lessonsService.reorder(courseId, lessonIds);
  }
}
