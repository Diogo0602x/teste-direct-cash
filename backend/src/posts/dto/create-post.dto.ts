import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength } from "class-validator";

export class CreatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsNotEmpty({ message: "Conteúdo é obrigatório" })
  @MaxLength(5000)
  content!: string;

  @IsString()
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: "URL da imagem inválida" })
  imageUrl?: string;

  @IsString()
  @IsOptional()
  churchId?: string;
}
