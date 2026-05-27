import { IsNotEmpty, IsInt, IsOptional, IsString } from "class-validator";

export class CreateEnrollmentDto {
  @IsInt()
  @IsNotEmpty({ message: "ID do usuário é obrigatório" })
  userId: number;

  @IsInt()
  @IsNotEmpty({ message: "ID da turma é obrigatório" })
  classId: number;

  @IsOptional()
  @IsString()
  status?: any;
}
