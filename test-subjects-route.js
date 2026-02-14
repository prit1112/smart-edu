import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'fetch-cookie';

const BASE_URL = 'http://localhost:3003';

// Create a cookie jar and wrap fetch
const fetchWithCookies = wrapper(fetch);

async function testSubjectsRoute() {
  try {
    console.log('🧪 Testing subjects route...');

    // First, login to get session
    console.log('1. Logging in...');
    const loginResponse = await fetchWithCookies(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'test@example.com',
        password: 'password123'
      }),
      redirect: 'manual' // Don't follow redirects automatically
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers.raw());

    if (loginResponse.status === 302) {
      console.log('✅ Login successful (redirect to dashboard)');
    } else {
      console.log('❌ Login failed');
      const loginText = await loginResponse.text();
      console.log('Login response:', loginText);
      return;
    }

    // Now test the subjects route
    console.log('2. Testing /student/subject route...');
    const subjectsResponse = await fetchWithCookies(`${BASE_URL}/student/subject`);

    console.log('Subjects response status:', subjectsResponse.status);
    console.log('Subjects response headers:', subjectsResponse.headers.raw());

    if (subjectsResponse.status === 200) {
      console.log('✅ Subjects route accessible');
      const html = await subjectsResponse.text();
      console.log('Response length:', html.length, 'characters');

      // Check if it contains expected content
      if (html.includes('My Subjects')) {
        console.log('✅ Page title found');
      } else {
        console.log('❌ Page title not found');
      }

      if (html.includes('Class')) {
        console.log('✅ Class level info found');
      } else {
        console.log('❌ Class level info not found');
      }

    } else {
      console.log('❌ Subjects route failed');
      const errorText = await subjectsResponse.text();
      console.log('Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing subjects route:', error.message);
  }
}

testSubjectsRoute();
