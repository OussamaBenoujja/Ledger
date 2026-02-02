export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELED = 'CANCELED',
    REFUSED = 'REFUSED',
}

export interface Reservation {
    id: string;
    userId: string;
    eventId: string;
    status: ReservationStatus;
    createdAt: Date;
    updatedAt: Date;
}
