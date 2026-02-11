import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { EventStatus } from './event-status.enum';
import { Reservation } from '../reservations/reservation.entity';

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    startsAt: Date;

    @Column()
    location: string;

    @Column({ default: '' })
    image: string;

    @Column('int')
    capacity: number;

    @Column({
        type: 'enum',
        enum: EventStatus,
        default: EventStatus.DRAFT,
    })
    status: EventStatus;

    @OneToMany(() => Reservation, (reservation) => reservation.event)
    reservations: Reservation[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
