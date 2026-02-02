import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { EventsModule } from '../events/events.module';
import { Reservation } from './reservation.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reservation]),
        EventsModule
    ],
    controllers: [ReservationsController],
    providers: [ReservationsService],
})
export class ReservationsModule { }
