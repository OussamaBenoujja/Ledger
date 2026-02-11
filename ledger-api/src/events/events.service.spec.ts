import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { EventStatus } from './event-status.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockEvent = {
  id: 'uuid',
  title: 'Test Event',
  description: 'Test Description',
  startsAt: new Date(),
  location: 'Test Location',
  capacity: 100,
  status: EventStatus.DRAFT,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('EventsService', () => {
  let service: EventsService;
  let repo;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((event) => Promise.resolve({ ...event, id: 'uuid' })),
    findOneBy: jest.fn().mockImplementation(({ id }) => {
      if (id === 'uuid') return Promise.resolve(mockEvent);
      return Promise.resolve(null);
    }),
    find: jest.fn().mockResolvedValue([mockEvent]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repo = module.get(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event with DRAFT status', async () => {
      const dto = {
        title: 'New Event',
        description: 'Desc',
        startsAt: new Date(),
        location: 'Loc',
        image: 'https://randomImage.com',
        capacity: 50,
      };

      const result = await service.create(dto);
      expect(result.status).toBe(EventStatus.DRAFT);
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining(dto));
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should publish draft event', async () => {
      const draftEvent = { ...mockEvent, status: EventStatus.DRAFT };
      mockRepository.findOneBy.mockResolvedValue(draftEvent);

      const result = await service.publish('uuid');
      expect(result.status).toBe(EventStatus.PUBLISHED);
      expect(repo.save).toHaveBeenCalled();
    });

    it('should return canceled event as is', async () => {
      const canceledEvent = { ...mockEvent, status: EventStatus.CANCELED };
      mockRepository.findOneBy.mockResolvedValue(canceledEvent);

      const result = await service.publish('uuid');
      expect(result.status).toBe(EventStatus.CANCELED);
    });
  });

  describe('update', () => {
    it('should update draft event', async () => {
      const draftEvent = { ...mockEvent, status: EventStatus.DRAFT };
      mockRepository.findOneBy.mockResolvedValue(draftEvent);

      const result = await service.update('uuid', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw Forbidden for published event', async () => {
      const publishedEvent = { ...mockEvent, status: EventStatus.PUBLISHED };
      mockRepository.findOneBy.mockResolvedValue(publishedEvent);

      await expect(service.update('uuid', { title: 'Updated' })).rejects.toThrow(ForbiddenException);
    });
  });
});
