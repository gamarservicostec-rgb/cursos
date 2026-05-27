import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { CheckInDto } from "./dto/check-in.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(JwtAuthGuard)
  @Post("check-in")
  checkIn(@Request() req, @Body() checkInDto: CheckInDto) {
    return this.attendanceService.checkIn(req.user.id, checkInDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("my")
  getMyAttendances(@Request() req) {
    return this.attendanceService.getMyAttendances(req.user.id);
  }
}
