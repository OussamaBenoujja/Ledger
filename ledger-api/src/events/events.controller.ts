import {
    Controller,
    Body,
    Get,
    Post,
    Param,
    Patch,
    Query,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Public } from '../auth/public.decorator';



@Controller('events')
export class EventsController {

    constructor(private readonly events: EventsService) { }
    @Roles(UserRole.ADMIN)
    @Post()
    create(@Body() dto: CreateEventDto) {
        return this.events.create({
            title: dto.title,
            description: dto.description,
            startsAt: new Date(dto.startsAt),
            location: dto.location,
            capacity: dto.capacity,
        });
    }

    @Roles(UserRole.ADMIN)
    @Patch(':id/publish')
    publish(@Param('id') id: string) {
        return this.events.publish(id);
    }



    @Roles(UserRole.ADMIN)
    @Patch(':id/cancel')
    cancel(@Param('id') id: string) {
        return this.events.cancel(id)
    }


    @Roles(UserRole.ADMIN)
    @Get()
    getAllEvents(@Query() params: PaginationDto) {
        return this.events.getAllEvents(params);
    }

    @Public()
    @Get('public')
    getPublicEvents(@Query() params: PaginationDto) {
        return this.events.getPublicEvents(params);
    }

    @Public()
    @Get('public/:id')
    getPublicEvent(@Param('id') id: string) {
        return this.events.getPublicEventById(id);
    }

    @Roles(UserRole.ADMIN)
    @Get(':id')
    getEvent(@Param('id') id: string) {
        return this.events.findById(id);
    }

    @Roles(UserRole.ADMIN)
    @Patch(':id')
    updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
        return this.events.update(id, {
            title: dto.title,
            description: dto.description,
            startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
            location: dto.location,
            capacity: dto.capacity,
        });
    }





}
