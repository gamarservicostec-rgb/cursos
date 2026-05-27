import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./modules/health/health.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CoursesModule } from "./modules/courses/courses.module";
import { ClassesModule } from "./modules/classes/classes.module";
import { EnrollmentsModule } from "./modules/enrollments/enrollments.module";
import { LessonsModule } from "./modules/lessons/lessons.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { UploadModule } from "./modules/upload/upload.module";
import * as express from "express";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    ClassesModule,
    EnrollmentsModule,
    LessonsModule,
    AttendanceModule,
    UploadModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(express.static(join(process.cwd(), "uploads")))
      .forRoutes("uploads");
  }
}

