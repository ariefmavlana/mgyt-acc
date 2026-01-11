import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testCSRFToken() {
    console.log('\n--- Testing CSRF Token Endpoint ---');
    try {
        const res = await axios.get(`${BASE_URL}/csrf-token`);
        if (res.data.csrfToken) {
            console.log('SUCCESS: CSRF Token generated:', res.data.csrfToken.substring(0, 10) + '...');
            return res.data.csrfToken;
        } else {
            console.log('FAIL: CSRF Token missing in response');
        }
    } catch (error: any) {
        console.log('FAIL: CSRF fetch error:', error.response?.data || error.message);
    }
}

async function testPasswordHistory() {
    console.log('\n--- Testing Password History Enforcement ---');
    const email = `history_${Date.now()}@example.com`;
    const password = 'Password123!';

    // 1. Register
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        namaLengkap: 'History Test',
        username: `history_${Date.now()}`,
        email: email,
        password: password,
        confirmPassword: password
    });

    // 2. Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: email,
        password: password
    });

    const cookies = loginRes.headers['set-cookie'];
    const authHeaders = { headers: { 'Cookie': cookies?.join('; ') } };

    // 3. Try to change password to the SAME one (should fail)
    try {
        await axios.post(`${BASE_URL}/auth/change-password`, {
            currentPassword: password,
            newPassword: password,
            confirmNewPassword: password
        }, authHeaders);
        console.log('FAIL: Accepted same password as history');
    } catch (error: any) {
        console.log('SUCCESS: Rejected same password with message:', error.response?.data?.message);
    }

    // 4. Change to a new valid password
    const newPassword = 'NewPassword123!';
    try {
        await axios.post(`${BASE_URL}/auth/change-password`, {
            currentPassword: password,
            newPassword: newPassword,
            confirmNewPassword: newPassword
        }, authHeaders);
        console.log('SUCCESS: Password changed.');
    } catch (error: any) {
        console.log('FAIL: Could not change password:', error.response?.data?.message);
    }
}

async function runTests() {
    await testCSRFToken();
    await testPasswordHistory();
    console.log('\nFinal verification suite completed.');
}

runTests();
