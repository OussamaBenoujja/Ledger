import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { ReservationStatus } from './reservation.types';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { EventsService } from '../events/events.service';
import { EventStatus } from '../events/event-status.enum';

@Injectable()
export class ReservationsService {
    constructor(
        @InjectRepository(Reservation)
        private reservationsRepository: Repository<Reservation>,
        private readonly eventsService: EventsService,
    ) { }

    async create(userId: string, dto: CreateReservationDto) {
        // 1. Get Event (awaiting because EventsService is async now)
        const event = await this.eventsService.findById(dto.eventId);

        // 2. Check Status
        if (event.status !== EventStatus.PUBLISHED) {
            throw new BadRequestException('Cannot reserve unpublished event');
        }

        // 3. Check Duplicates for this user
        const existing = await this.reservationsRepository.findOne({
            where: [
                { userId, eventId: dto.eventId, status: ReservationStatus.PENDING },
                { userId, eventId: dto.eventId, status: ReservationStatus.CONFIRMED }
            ]
        });

        if (existing) {
            throw new ConflictException('User already has an active reservation for this event');
        }

        const activeReservationsCount = await this.reservationsRepository.count({
            where: [
                { eventId: dto.eventId, status: ReservationStatus.CONFIRMED },
                { eventId: dto.eventId, status: ReservationStatus.PENDING }
            ]
        });

        if (activeReservationsCount >= event.capacity) {
            throw new ConflictException('Event is full');
        }

        const reservation = this.reservationsRepository.create({
            userId,
            eventId: dto.eventId,
            status: ReservationStatus.PENDING,
        });

        return this.reservationsRepository.save(reservation);
    }

    async findAll(filters?: { eventId?: string; userId?: string }) {
        const where: any = {};
        if (filters?.eventId) {
            where.eventId = filters.eventId;
        }
        if (filters?.userId) {
            where.userId = filters.userId;
        }

        return this.reservationsRepository.find({ where });
    }

    async findByUser(userId: string) {
        return this.reservationsRepository.find({
            where: { userId },
            relations: ['event'],
            order: { createdAt: 'DESC' }
        });
    }

    async cancel(userId: string, reservationId: string) {
        const reservation = await this.findById(reservationId);

        if (reservation.userId !== userId) {
            throw new NotFoundException('Reservation not found');
        }

        if (
            reservation.status === ReservationStatus.CANCELED ||
            reservation.status === ReservationStatus.REFUSED
        ) {
            return reservation;
        }

        reservation.status = ReservationStatus.CANCELED;
        return this.reservationsRepository.save(reservation);
    }

    // Admin helper to find by ID without ownership check
    async findById(id: string) {
        const reservation = await this.reservationsRepository.findOneBy({ id });
        if (!reservation) throw new NotFoundException('Reservation not found');
        return reservation;
    }

    async generatePdfTicket(reservationId: string): Promise<Buffer> {
        const reservation = await this.findById(reservationId);

        if (reservation.status !== ReservationStatus.CONFIRMED) {
            throw new BadRequestException('Ticket available only for confirmed reservations');
        }

        const event = await this.eventsService.findById(reservation.eventId);

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const data = Buffer.concat(buffers);
                resolve(data);
            });

            doc.on('error', (err) => {
                reject(err);
            });

            // Content
            doc.fontSize(25).text('Event Ticket', { align: 'center' });
            doc.moveDown();
            doc.fontSize(18).text(event.title || 'Untitled Event');

            const dateStr = event.startsAt instanceof Date
                ? event.startsAt.toLocaleDateString()
                : new Date(event.startsAt).toLocaleDateString();

            doc.fontSize(12).text(`Date: ${dateStr}`);
            doc.text(`Location: ${event.location || 'TBD'}`);
            doc.moveDown();
            doc.text(`Reservation ID: ${reservation.id}`);
            doc.text(`Participant ID: ${reservation.userId}`);
            doc.moveDown();
            doc.fontSize(10).text('Please present this ticket at the entrance.', { align: 'center' });

            doc.end();
        });
    }

    async updateStatus(id: string, status: ReservationStatus) {
        const reservation = await this.findById(id);
        reservation.status = status;
        return this.reservationsRepository.save(reservation);
    }
}
