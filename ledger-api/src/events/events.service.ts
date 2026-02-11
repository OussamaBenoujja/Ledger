import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { EventStatus } from './event-status.enum';

@Injectable()
export class EventsService {

    constructor(
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
    ) { }

    async create(params: {
        title: string;
        description: string;
        startsAt: Date;
        location: string;
        image: string;
        capacity: number;
    }) {
        const event = this.eventsRepository.create({
            title: params.title.trim(),
            description: params.description.trim(),
            startsAt: params.startsAt,
            location: params.location.trim(),
            image: params.image.trim(),
            capacity: params.capacity,
            status: EventStatus.DRAFT,
        });

        return this.eventsRepository.save(event);
    }

    async findById(id: string) {
        const event = await this.eventsRepository.findOneBy({ id });
        if (!event) throw new NotFoundException('Event Not Found');
        return event;
    }

    async publish(id: string) {
        const event = await this.findById(id);

        if (event.status === EventStatus.CANCELED) return event;

        event.status = EventStatus.PUBLISHED;
        return this.eventsRepository.save(event);
    }

    async cancel(id: string) {
        const event = await this.findById(id);
        event.status = EventStatus.CANCELED;
        return this.eventsRepository.save(event);
    }

    async getAllEvents(params: { offset?: number; limit?: number; status?: EventStatus }) {
        const { offset = 0, limit = 10, status } = params;

        const where: any = {};
        if (status) {
            where.status = status;
        }

        return this.eventsRepository.find({
            where,
            skip: offset,
            take: limit,
        });
    }

    async getPublicEvents(params: { offset?: number; limit?: number }) {
        const { offset = 0, limit = 10 } = params;

        return this.eventsRepository.find({
            where: { status: EventStatus.PUBLISHED },
            skip: offset,
            take: limit,
        });
    }

    async getPublicEventById(id: string) {
        const event = await this.findById(id);
        if (event.status !== EventStatus.PUBLISHED) throw new NotFoundException('Event not found');
        return event;
    }

    async update(
        id: string,
        params: {
            title?: string;
            description?: string;
            startsAt?: Date;
            location?: string;
            capacity?: number;
        },
    ) {
        const event = await this.findById(id);

        if (event.status !== EventStatus.DRAFT) {
            throw new ForbiddenException('Only DRAFT events can be updated');
        }

        if (params.title !== undefined) event.title = params.title.trim();
        if (params.description !== undefined) event.description = params.description.trim();
        if (params.startsAt !== undefined) event.startsAt = params.startsAt;
        if (params.location !== undefined) event.location = params.location.trim();
        if (params.capacity !== undefined) event.capacity = params.capacity;

        return this.eventsRepository.save(event);
    }
}
