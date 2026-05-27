import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from "class-validator";

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
  @Min(1, { message: "Duração mínima é 1 hora" })
  duration?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;
}
