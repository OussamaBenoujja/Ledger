import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MinLength
} from 'class-validator';
import { UserRole } from './user-role.enum'





export class CreateUserDTO {

    @IsEmail()
    email: string;



    @IsString()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;




}