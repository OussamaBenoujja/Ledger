const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = `admin_${Date.now()}@test.com`;
const USER_EMAIL = `user_${Date.now()}@test.com`;
const PASSWORD = 'password123';

async function runTests() {
    try {
        console.log('🚀 Starting API Verification...');

        // 1. Register Admin
        console.log(`\n1. Registering Admin (${ADMIN_EMAIL})...`);
        await axios.post(`${BASE_URL}/auth/register`, {
            email: ADMIN_EMAIL,
            password: PASSWORD,
            role: 'ADMIN' // Assuming endpoint allows role setting for simplicity/dev, if not we might need to seed
        });
        console.log('✅ Admin Registered');

        // 2. Login Admin
        console.log('\n2. Logging in Admin...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: PASSWORD
        });
        const adminToken = adminLogin.data.access_token;
        console.log('✅ Admin Logged In');

        // 3. Create Event (Draft)
        console.log('\n3. Creating Event...');
        const eventRes = await axios.post(`${BASE_URL}/events`, {
            title: 'Test Event',
            description: 'Testing API',
            startsAt: new Date(Date.now() + 86400000).toISOString(),
            location: 'Internet',
            capacity: 5
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        const eventId = eventRes.data.id;
        console.log(`✅ Event Created: ${eventId}`);

        // 4. Publish Event
        console.log('\n4. Publishing Event...');
        await axios.patch(`${BASE_URL}/events/${eventId}/publish`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Event Published');

        // 5. Register Participant
        console.log(`\n5. Registering Participant (${USER_EMAIL})...`);
        await axios.post(`${BASE_URL}/auth/register`, {
            email: USER_EMAIL,
            password: PASSWORD
        });
        console.log('✅ Participant Registered');

        // 6. Login Participant
        console.log('\n6. Logging in Participant...');
        const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: USER_EMAIL,
            password: PASSWORD
        });
        const userToken = userLogin.data.access_token;
        console.log('✅ Participant Logged In');

        // 7. Create Reservation
        console.log('\n7. Creating Reservation...');
        const resRes = await axios.post(`${BASE_URL}/reservations`, {
            eventId: eventId
        }, { headers: { Authorization: `Bearer ${userToken}` } });
        const reservationId = resRes.data.id;
        console.log(`✅ Reservation Created: ${reservationId}`);

        // 8. Admin List Reservations (with filter)
        console.log('\n8. Admin Listing Reservations (Filtered)...');
        const listRes = await axios.get(`${BASE_URL}/reservations?eventId=${eventId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (listRes.data.length === 0) throw new Error('Reservation not found in list');
        console.log(`✅ Admin found ${listRes.data.length} reservation(s)`);

        // 9. Admin Confirm Reservation
        console.log('\n9. Admin Confirming Reservation...');
        await axios.patch(`${BASE_URL}/reservations/${reservationId}/status`, {
            status: 'CONFIRMED'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('✅ Reservation Confirmed');

        // 10. Get Ticket (should work now)
        console.log('\n10. Getting PDF Ticket...');
        const ticketRes = await axios.get(`${BASE_URL}/reservations/${reservationId}/ticket`, {
            headers: { Authorization: `Bearer ${userToken}` },
            responseType: 'arraybuffer' // Important for PDF
        });
        if (ticketRes.headers['content-type'] !== 'application/pdf') throw new Error('Not a PDF');
        console.log(`✅ Ticket Retrieved (${ticketRes.data.length} bytes)`);

        console.log('\n🎉 ALL TESTS PASSED!');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runTests();
