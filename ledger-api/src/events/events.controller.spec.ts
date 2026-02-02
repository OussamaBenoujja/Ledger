import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventStatus } from './event-status.enum';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEventsService = {
    create: jest.fn().mockImplementation((dto) => ({ ...dto, id: '1', status: EventStatus.DRAFT })),
    getPublicEventById: jest.fn().mockReturnValue({ id: '1', status: EventStatus.PUBLISHED }),
    findById: jest.fn().mockReturnValue({ id: '1' }),
    update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
    getPublicEvents: jest.fn().mockReturnValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = {
        title: 'Test',
        description: 'Desc',
        startsAt: '2025-01-01T00:00:00Z',
        location: 'Loc',
        capacity: 10,
      };
      // Controller expects Date object conversion handled by Pipes usually, 
      // but our DTO has string. Our service expects Date.
      // Let's assume validation pipe transforms it or we pass it as is if DTO is string.
      // checking implementation: Controller passes DTO as is? No... 
      // Let's check Controller implementation again. 
      // Controller: create(@Body() dto: CreateEventDto) {
      //    return this.eventsService.create({ ...dto, startsAt: new Date(dto.startsAt) });
      // } 

      await controller.create(dto);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('getPublicEvent', () => {
    it('should return event', async () => {
      const result = await controller.getPublicEvent('1');
      expect(result).toEqual({ id: '1', status: EventStatus.PUBLISHED });
    });
  });
});
