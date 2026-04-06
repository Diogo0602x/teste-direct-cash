import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: "Nome é obrigatório" })
  @MaxLength(120)
  name!: string;

  @IsEmail({}, { message: "E-mail inválido" })
  @IsNotEmpty({ message: "E-mail é obrigatório" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Senha é obrigatória" })
  @MinLength(8, { message: "Senha deve ter no mínimo 8 caracteres" })
  @MaxLength(72)
  password!: string;
}
