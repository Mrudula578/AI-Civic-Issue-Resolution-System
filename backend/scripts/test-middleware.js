// Test script to verify middleware functionality
// Tests validation middleware with various invalid inputs

const baseUrl = 'http://localhost:3000/api';

const testCases = [
  {
    name: 'Invalid email format',
    endpoint: '/auth/register',
    data: {
      email: 'invalid-email',
      password: 'Password123',
      name: 'Test User'
    },
    expectedStatus: 422
  },
  {
    name: 'Weak password',
    endpoint: '/auth/register',
    data: {
      email: 'test@example.com',
      password: 'weak',
      name: 'Test User'
    },
    expectedStatus: 422
  },
  {
    name: 'Empty name',
    endpoint: '/auth/register',
    data: {
      email: 'test@example.com',
      password: 'Password123',
      name: ''
    },
    expectedStatus: 422
  },
  {
    name: 'Valid registration data (will fail on DB, but validation should pass)',
    endpoint: '/auth/register',
    data: {
      email: 'test@example.com',
      password: 'Password123',
      name: 'Test User'
    },
    expectedStatus: 500 // Database error, not validation error
  },
  {
    name: 'Missing login fields',
    endpoint: '/auth/login',
    data: {
      email: 'test@example.com'
      // password missing
    },
    expectedStatus: 422
  }
];

async function testValidation() {
  console.log('🧪 Testing validation middleware...\n');
  
  for (const test of testCases) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const response = await fetch(`${baseUrl}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.data),
      });
      
      const result = await response.text();
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ PASS - Status: ${response.status}`);
      } else {
        console.log(`❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`);
        console.log(`   Response: ${result.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR - ${test.name}:`, error.message);
    }
    
    console.log('');
  }
}

// Test authentication middleware (requires valid token)
async function testAuthMiddleware() {
  console.log('🔐 Testing authentication middleware...\n');
  
  try {
    console.log('Testing protected route without token...');
    const response = await fetch(`${baseUrl}/users/me`);
    
    if (response.status === 401) {
      console.log('✅ PASS - Correctly rejected request without token');
    } else {
      console.log(`❌ FAIL - Expected 401, got ${response.status}`);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testValidation();
  await testAuthMiddleware();
}

runAllTests().catch(console.error);