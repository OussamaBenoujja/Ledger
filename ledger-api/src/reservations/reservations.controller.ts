import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGaurd } from '../auth/jwt-auth.gaurd';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { ReservationStatus } from './reservation.types';

@UseGuards(JwtAuthGaurd)
@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Post()
    create(@Req() req: any, @Body() dto: CreateReservationDto) {
        return this.reservationsService.create(req.user.userId, dto);
    }

    @Roles(UserRole.ADMIN)
    @Get()
    findAll(@Query('eventId') eventId?: string, @Query('userId') userId?: string) {
        return this.reservationsService.findAll({ eventId, userId });
    }

    @Get('me')
    findMyReservations(@Req() req: any) {
        return this.reservationsService.findByUser(req.user.userId);
    }

    @Patch(':id/cancel')
    cancel(@Req() req: any, @Param('id') id: string) {


        return this.reservationsService.cancel(req.user.userId, id);
    }

    @Roles(UserRole.ADMIN)
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: ReservationStatus,
    ) {
        return this.reservationsService.updateStatus(id, status);
    }

    @Get(':id/ticket')
    async getTicket(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.reservationsService.generatePdfTicket(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="ticket-${id}.pdf"`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
