// Simple test script to verify auth endpoints work
// Note: This requires PostgreSQL to be running and migrated

const testData = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

async function testAuth() {
  const baseUrl = 'http://localhost:3000/api';
  
  console.log('🧪 Testing authentication endpoints...\n');
  
  try {
    // Test registration (will fail without database, but should show correct error handling)
    console.log('1. Testing registration...');
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const registerResult = await registerResponse.text();
    console.log('Register Status:', registerResponse.status);
    console.log('Register Response:', registerResult);
    
  } catch (error) {
    console.log('❌ Registration test failed:', error.message);
  }
  
  console.log('\n2. Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthResult = await healthResponse.json();
    console.log('✅ Health check passed:', healthResult);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

// Run tests
testAuth().catch(console.error);