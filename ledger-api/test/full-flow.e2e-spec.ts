import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserRole } from './../src/users/user-role.enum';

describe('Full Flow (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    let userToken: string;
    let createdEventId: string;

    // Unique suffix to avoid DB collisions
    const uniqueSuffix = Date.now();
    const adminEmail = `admin_${uniqueSuffix}@example.com`;
    const userEmail = `user_${uniqueSuffix}@example.com`;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('1. Register Admin', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: adminEmail,
                password: 'password123',
                role: UserRole.ADMIN,
            })
            .expect(201);
    });

    it('2. Login Admin', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: adminEmail,
                password: 'password123',
            })
            .expect(201);

        adminToken = response.body.access_token;
        expect(adminToken).toBeDefined();
    });

    it('3. Register User', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: userEmail,
                password: 'password123',
                role: UserRole.USER,
            })
            .expect(201);
    });

    it('4. Login User', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: userEmail,
                password: 'password123',
            })
            .expect(201);

        userToken = response.body.access_token;
        expect(userToken).toBeDefined();
    });

    it('5. Create Event (as Admin)', async () => {
        const response = await request(app.getHttpServer())
            .post('/events')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: `E2E Event ${uniqueSuffix}`,
                description: 'An event created by E2E test',
                startsAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                location: 'Test Location',
                capacity: 10,
            })
            .expect(201);

        createdEventId = response.body.id;
        expect(createdEventId).toBeDefined();
    });

    it('6. Publish Event (as Admin)', async () => {
        await request(app.getHttpServer())
            .patch(`/events/${createdEventId}/publish`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
    });

    it('7. Reserve Spot (as User)', async () => {
        const response = await request(app.getHttpServer())
            .post('/reservations')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                eventId: createdEventId,
            })
            .expect(201);

        expect(response.body.status).toBe('PENDING'); // Assuming default is PENDING
    });

    it('8. Verify Reservation (as User)', async () => {
        const response = await request(app.getHttpServer())
            .get('/reservations/me')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        const myReservation = response.body.find((r: any) => r.event.id === createdEventId);
        expect(myReservation).toBeDefined();
        expect(myReservation.status).toBe('PENDING');
    });
});
