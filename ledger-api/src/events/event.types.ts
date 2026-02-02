


import { EventStatus } from './event-status.enum'





export type Event = {
    id: string;
    title: string;
    description: string;
    startsAt: Date;
    location: string;
    capacity: number;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
};


