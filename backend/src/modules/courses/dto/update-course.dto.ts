import { IsOptional, IsString, IsNumber, Min, IsEnum } from "class-validator";

enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  modules?: any[];

  @IsOptional()
  @IsEnum(CourseStatus, {
    message: "Status deve ser DRAFT, PUBLISHED ou ARCHIVED",
  })
  status?: CourseStatus;
}
