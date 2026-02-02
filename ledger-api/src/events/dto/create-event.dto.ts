import {
    IsDateString, IsInt, IsNotEmpty, IsString, Min
} from 'class-validator'


export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;


    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDateString()
    startsAt: string;


    @IsString()
    @IsNotEmpty()
    location: string;


    @IsInt()
    @Min(1)
    capacity: number;


}