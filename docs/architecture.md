# Architecture Documentation

## 1. Global Architecture

The project follows a modular Client-Server architecture, containerized with Docker.

### Frontend (`ledger-web`)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: Context API (`AuthContext`)
- **Data Fetching**: Server Components for public data, Client Components for interactivity.

### Backend (`ledger-api`)
- **Framework**: NestJS
- **Language**: TypeScript
- **Database ORM**: TypeORM
- **Database**: PostgreSQL 13
- **Authentication**: JWT (Passport)
- **Validation**: `class-validator` / `class-transformer`

### Infrastructure
- **Docker Compose**: Orchestrates `ledger_web`, `ledger_api`, and `ledger_db`.
- **CI/CD**: GitHub Actions (Lint, Test, Build, Publish).

---

## 2. Class Diagram (Entities)

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String password
        +UserRole role
        +Date createdAt
        +reservations: Reservation[]
    }

    class Event {
        +UUID id
        +String title
        +String description
        +Date startsAt
        +String location
        +Int capacity
        +EventStatus status
        +reservations: Reservation[]
    }

    class Reservation {
        +UUID id
        +UUID userId
        +UUID eventId
        +ReservationStatus status
        +Date createdAt
        +user: User
        +event: Event
    }

    class UserRole {
        <<enumeration>>
        ADMIN
        USER
    }

    class EventStatus {
        <<enumeration>>
        DRAFT
        PUBLISHED
        CANCELED
    }

    class ReservationStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        REFUSED
        CANCELED
    }

    User "1" --> "*" Reservation : has
    Event "1" --> "*" Reservation : has
    User -- UserRole
    Event -- EventStatus
    Reservation -- ReservationStatus
```

## 3. Reservation Flow Sequence

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend (BookingActions)
    participant API as Backend (ReservationsController)
    participant DB as PostgreSQL

    U->>FE: Click "Reserve"
    FE->>API: POST /reservations { eventId } (Bearer Token)
    API->>API: Validate Token & User Role
    API->>DB: Check Event Capacity & Existing Reservation
    
    alt Capacity Full OR Already Reserved
        DB-->>API: Error
        API-->>FE: 400 Bad Request
        FE-->>U: Show Error Message
    else Capacity Available
        API->>DB: Create Reservation (PENDING)
        DB-->>API: Success
        API-->>FE: 201 Created
        FE-->>U: Show Success Message
        FE->>FE: specific Router Refresh (Update capacity)
    end
```
