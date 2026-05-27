import { IsNotEmpty, IsInt, IsString } from "class-validator";

export class CheckInDto {
  @IsInt()
  @IsNotEmpty({ message: "ID da aula é obrigatório" })
  lessonId: number;

  @IsString()
  @IsNotEmpty({ message: "Token de presença local é obrigatório" })
  presenceToken: string;
}
