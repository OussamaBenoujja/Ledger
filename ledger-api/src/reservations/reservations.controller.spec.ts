import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

describe('ReservationsController', () => {
    let controller: ReservationsController;
    let service: ReservationsService;

    const mockReservationsService = {
        create: jest.fn().mockImplementation((userId, dto) => ({ id: '1', userId, ...dto })),
        findAll: jest.fn().mockReturnValue([]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReservationsController],
            providers: [
                {
                    provide: ReservationsService,
                    useValue: mockReservationsService,
                },
            ],
        }).compile();

        controller = module.get<ReservationsController>(ReservationsController);
        service = module.get<ReservationsService>(ReservationsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create with user id from req', async () => {
            const req = { user: { userId: 'user-1' } };
            const dto = { eventId: 'event-1' };

            const result = await controller.create(req, dto);

            expect(service.create).toHaveBeenCalledWith('user-1', dto);
            expect(result).toHaveProperty('userId', 'user-1');
        });
    });
});
