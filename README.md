# Ledger

Ledger is a web-based event reservation application that centralizes the management of events, participants, and reservations with role-based access control.

The platform allows administrators to manage events and reservations, while participants can browse events and reserve available seats according to defined business rules.

---

## Features

- User authentication with JWT
- Role-based authorization (Admin / Participant)
- Event lifecycle management (draft, publish, cancel)
- Public event catalog with remaining seat tracking
- Reservation lifecycle management (pending, confirmed, refused, canceled)
- Participant and admin dashboards
- PDF ticket generation for confirmed reservations
- Dockerized deployment
- CI/CD pipeline with GitHub Actions

---

## Tech Stack

### Back-end
- NestJS (TypeScript)
- PostgreSQL or MongoDB
- JWT Authentication
- Jest (unit & e2e tests)

### Front-end
- Next.js
- TypeScript
- SSR for public pages
- CSR for authenticated areas
- Redux or Context API

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Docker Hub

---

## Project Structure

