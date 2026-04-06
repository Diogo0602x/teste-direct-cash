import { IsEmail, IsOptional, IsString, MaxLength, IsUrl } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsEmail({}, { message: "E-mail inválido" })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsUrl({ require_tld: false }, { message: "URL de avatar inválida" })
  @IsOptional()
  avatarUrl?: string;
}
