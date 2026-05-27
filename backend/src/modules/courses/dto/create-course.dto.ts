import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
} from "class-validator";

enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: "Título é obrigatório" })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Preço não pode ser negativo" })
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Duração não pode ser negativa" })
  duration?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsEnum(CourseStatus, {
    message: "Status deve ser DRAFT, PUBLISHED ou ARCHIVED",
  })
  status?: CourseStatus;

  @IsOptional()
  modules?: any[];
}
