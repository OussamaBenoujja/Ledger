import { Controller, Body, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGaurd } from './jwt-auth.gaurd';
import { Roles } from './roles.decorator'
import { UserRole } from '../users/user-role.enum';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {

    constructor(private readonly auth: AuthService) { }


    @Public()
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Public()
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto);
    }


    @UseGuards(JwtAuthGaurd)
    @Get('me')
    me(@Req() req: any) {
        return req.user;
    }




    @UseGuards(JwtAuthGaurd)
    @Roles(UserRole.ADMIN)
    @Get('admin-check')
    adminCheck() {
        return { ok: true }
    }


}
