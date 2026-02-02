export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'PARTICIPANT';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export enum EventStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    CANCELED = 'CANCELED',
    COMPLETED = 'COMPLETED'
}

export interface Event {
    id: string;
    title: string;
    description: string;
    startsAt: string; // Changed from date to match backend
    location: string;
    capacity: number;
    filled_participants: number;
    status: EventStatus;
}

export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELED = 'CANCELED',
    REFUSED = 'REFUSED'
}

export interface Reservation {
    id: string;
    userId: string;
    status: ReservationStatus;
    event: Event;
    createdAt: string;
}
