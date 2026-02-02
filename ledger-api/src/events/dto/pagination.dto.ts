import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { EventStatus } from '../event-status.enum';
import { Type } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    offset?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number;

    @IsOptional()
    @IsEnum(EventStatus)
    status?: EventStatus;
}