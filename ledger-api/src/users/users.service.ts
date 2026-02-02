import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(params: { email: string; passwordHash: string; role?: UserRole }) {
        const email = params.email.toLowerCase().trim();

        const existing = await this.usersRepository.findOneBy({ email });
        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const user = this.usersRepository.create({
            email,
            passwordHash: params.passwordHash,
            role: params.role ?? UserRole.PARTICIPANT,
        });

        await this.usersRepository.save(user);
        return this.sanitize(user);
    }

    async findRawByEmail(email: string) {
        const e = email.toLowerCase().trim();
        return this.usersRepository.findOneBy({ email: e });
    }

    async findById(id: string) {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) throw new NotFoundException('User not found');
        return this.sanitize(user);
    }

    private sanitize(user: User) {
        const { passwordHash, ...safe } = user;
        return safe;
    }
}
