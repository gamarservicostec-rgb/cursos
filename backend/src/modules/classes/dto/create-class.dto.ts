import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  Min,
} from "class-validator";

export class CreateClassDto {
  @IsInt()
  @IsNotEmpty({ message: "ID do curso é obrigatório" })
  courseId: number;

  @IsString()
  @IsNotEmpty({ message: "Nome da turma é obrigatório" })
  name: string;

  @IsDateString({}, { message: "Data de início inválida" })
  startDate: string;

  @IsDateString({}, { message: "Data de término inválida" })
  endDate: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: "Mínimo de 1 aluno por turma" })
  maxStudents?: number;
}
