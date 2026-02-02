import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user-role.enum';


@Injectable()
export class AuthService {
    constructor(
        private readonly users: UsersService,
        private readonly jwt: JwtService,
    ) { }


    async register(params: { email: string; password: string; role?: UserRole }) {
        const passwordHash = await bcrypt.hash(params.password, 10);


        return this.users.create({
            email: params.email,
            passwordHash,
            role: params.role,
        });
    }


    async login(params: { email: string; password: string }) {
        const user = await this.users.findRawByEmail(params.email);
        if (!user) throw new UnauthorizedException('!Invalid credentials');


        const ok = await bcrypt.compare(params.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: user.id, role: user.role };
        const access_token = await this.jwt.signAsync(payload);


        return { access_token };

    }


}
