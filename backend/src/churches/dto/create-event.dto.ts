import { IsDateString, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateEventDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}
