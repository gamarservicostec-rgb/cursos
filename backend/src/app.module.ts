import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./modules/health/health.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CoursesModule } from "./modules/courses/courses.module";
import { ClassesModule } from "./modules/classes/classes.module";
import { EnrollmentsModule } from "./modules/enrollments/enrollments.module";
import { LessonsModule } from "./modules/lessons/lessons.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";

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
  ],
})
export class AppModule {}
