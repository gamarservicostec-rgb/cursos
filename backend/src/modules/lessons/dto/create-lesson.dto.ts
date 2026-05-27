import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from "class-validator";

export class CreateLessonDto {
  @IsInt()
  @IsNotEmpty()
  subjectId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number; // duraÃ§Ã£o em minutos

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
