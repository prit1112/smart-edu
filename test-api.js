import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002';

// Test notification creation
async function testNotificationCreation() {
  try {
    console.log('🧪 Testing notification creation...');

    const response = await fetch(`${BASE_URL}/admin/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'API Test Notification',
        message: 'This is a test notification from API',
        target: 'all',
        channels: { inApp: true, push: false, whatsapp: false }
      })
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);

  } catch (error) {
    console.error('Error testing notification creation:', error.message);
  }
}

// Test student notifications retrieval
async function testStudentNotifications() {
  try {
    console.log('🧪 Testing student notifications retrieval...');

    const response = await fetch(`${BASE_URL}/student/notifications`);

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);

  } catch (error) {
    console.error('Error testing student notifications:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API tests...\n');

  await testNotificationCreation();
  console.log('');

  await testStudentNotifications();
  console.log('');

  console.log('✅ API tests completed');
}

runTests();
