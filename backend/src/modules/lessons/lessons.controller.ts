import { Controller, Get } from "@nestjs/common";
import { LessonsService } from "./lessons.service";

@Controller("admin/lessons")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }
}
