import { IsArray, IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";
import { ScheduleType } from "@prisma/client";

export class CreateScheduleDto {
  @IsEnum(ScheduleType)
  type: ScheduleType = ScheduleType.OTHER;

  @IsString()
  title!: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "time deve estar no formato HH:mm" })
  time!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
