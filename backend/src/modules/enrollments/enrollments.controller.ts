import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import { EnrollmentsService } from "./enrollments.service";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("enrollments")
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createEnrollmentDto: CreateEnrollmentDto) {
    if (req.user.role !== "ADMIN" && createEnrollmentDto.userId !== req.user.id) {
      throw new ForbiddenException("Você só pode criar matrículas para você mesmo");
    }
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  findAll(@Query("status") status?: string) {
    return this.enrollmentsService.findAll(status);
  }

  @Get("my")
  @UseGuards(JwtAuthGuard)
  findMyEnrollments(@Request() req) {
    return this.enrollmentsService.findByUser(req.user.id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.enrollmentsService.findById(id);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: string,
  ) {
    return this.enrollmentsService.updateStatus(id, status);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
