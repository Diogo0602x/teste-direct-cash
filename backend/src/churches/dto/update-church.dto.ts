import { IsString, IsOptional, MaxLength, IsUrl } from "class-validator";

export class UpdateChurchDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsUrl({ require_tld: false }, { message: "URL do logo inválida" })
  @IsOptional()
  logoUrl?: string;

  @IsUrl({ require_tld: false }, { message: "URL do site inválida" })
  @IsOptional()
  website?: string;
}
