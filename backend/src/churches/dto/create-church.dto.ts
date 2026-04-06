import { IsString, IsNotEmpty, Matches, IsOptional, MaxLength, IsUrl } from "class-validator";

export class CreateChurchDto {
  @IsString()
  @IsNotEmpty({ message: "CNPJ é obrigatório" })
  @Matches(/^\d{14}$/, {
    message: "CNPJ deve conter exatamente 14 dígitos numéricos (sem pontuação)",
  })
  cnpj!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsUrl({ require_tld: false }, { message: "URL do site inválida" })
  @IsOptional()
  website?: string;
}
