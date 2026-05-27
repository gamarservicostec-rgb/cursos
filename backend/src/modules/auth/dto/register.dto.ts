import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name: string;

  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty({ message: "Email é obrigatório" })
  email: string;

  @IsString()
  @MinLength(6, { message: "Senha deve ter no mínimo 6 caracteres" })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  cpf?: string;
}
