import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  Min,
  IsEnum,
} from "class-validator";

enum ClassStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudents?: number;

  @IsOptional()
  @IsEnum(ClassStatus, {
    message: "Status deve ser SCHEDULED, IN_PROGRESS, COMPLETED ou CANCELLED",
  })
  status?: ClassStatus;
}
