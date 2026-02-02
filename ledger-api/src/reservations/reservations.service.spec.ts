import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation } from './reservation.entity';
import { EventsService } from '../events/events.service';
import { EventStatus } from '../events/event-status.enum';
import { ReservationStatus } from './reservation.types';
import { BadRequestException, ConflictException } from '@nestjs/common';

const mockEvent = {
    id: 'event-id',
    title: 'Event',
    capacity: 10,
    status: EventStatus.PUBLISHED,
};

const mockReservation = {
    id: 'res-id',
    userId: 'user-id',
    eventId: 'event-id',
    status: ReservationStatus.PENDING,
};

describe('ReservationsService', () => {
    let service: ReservationsService;
    let repo;
    let eventsService;

    const mockRepository = {
        create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 'res-id' })),
        save: jest.fn().mockImplementation((res) => Promise.resolve(res)),
        findOne: jest.fn(),
        count: jest.fn(),
        findOneBy: jest.fn().mockResolvedValue(mockReservation),
    };

    const mockEventsService = {
        findById: jest.fn().mockResolvedValue(mockEvent),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReservationsService,
                {
                    provide: getRepositoryToken(Reservation),
                    useValue: mockRepository,
                },
                {
                    provide: EventsService,
                    useValue: mockEventsService,
                },
            ],
        }).compile();

        service = module.get<ReservationsService>(ReservationsService);
        repo = module.get(getRepositoryToken(Reservation));
        eventsService = module.get(EventsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should fail if event is not published', async () => {
            mockEventsService.findById.mockResolvedValue({ ...mockEvent, status: EventStatus.DRAFT });

            await expect(service.create('user-id', { eventId: 'event-id' }))
                .rejects.toThrow(BadRequestException);
        });

        it('should fail if user already has reservation', async () => {
            mockEventsService.findById.mockResolvedValue(mockEvent);
            mockRepository.findOne.mockResolvedValue(mockReservation); // Found

            await expect(service.create('user-id', { eventId: 'event-id' }))
                .rejects.toThrow(ConflictException);
        });

        it('should fail if event is full', async () => {
            mockEventsService.findById.mockResolvedValue({ ...mockEvent, capacity: 5 });
            mockRepository.findOne.mockResolvedValue(null); // Not duplicate
            mockRepository.count.mockResolvedValue(5); // Full

            await expect(service.create('user-id', { eventId: 'event-id' }))
                .rejects.toThrow(ConflictException);

        });

        it('should create reservation if valid', async () => {
            mockEventsService.findById.mockResolvedValue(mockEvent);
            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.count.mockResolvedValue(0);

            const res = await service.create('user-id', { eventId: 'event-id' });
            expect(res).toBeDefined();
            expect(repo.save).toHaveBeenCalled();
        });
    });
});
