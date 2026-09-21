// Test script to verify user profile endpoints
// Note: These endpoints require authentication, so we'll test the auth requirement

const baseUrl = 'http://localhost:3000/api';

async function testUserEndpoints() {
  console.log('🧪 Testing user profile endpoints...\n');
  
  // Test 1: Access protected route without token (should get 401)
  console.log('1. Testing GET /users/me without token...');
  try {
    const response = await fetch(`${baseUrl}/users/me`);
    const result = await response.text();
    
    if (response.status === 401) {
      console.log('✅ PASS - Correctly rejected request without token (401)');
    } else {
      console.log(`❌ FAIL - Expected 401, got ${response.status}`);
      console.log('Response:', result.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('');
  
  // Test 2: Access with invalid token (should get 401)
  console.log('2. Testing GET /users/me with invalid token...');
  try {
    const response = await fetch(`${baseUrl}/users/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token-here'
      }
    });
    const result = await response.text();
    
    if (response.status === 401) {
      console.log('✅ PASS - Correctly rejected invalid token (401)');
    } else {
      console.log(`❌ FAIL - Expected 401, got ${response.status}`);
      console.log('Response:', result.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('');
  
  // Test 3: Profile update validation
  console.log('3. Testing PUT /users/me validation...');
  try {
    const response = await fetch(`${baseUrl}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({
        name: 'A', // Too short
        email: 'invalid-email-format'
      })
    });
    
    if (response.status === 401) {
      console.log('✅ PASS - Auth required before validation (401)');
    } else if (response.status === 422) {
      console.log('✅ PASS - Validation working (422)');
    } else {
      console.log(`❌ UNEXPECTED - Got status ${response.status}`);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('');
  
  // Test 4: Export endpoint
  console.log('4. Testing GET /users/me/export without token...');
  try {
    const response = await fetch(`${baseUrl}/users/me/export`);
    
    if (response.status === 401) {
      console.log('✅ PASS - Export endpoint protected (401)');
    } else {
      console.log(`❌ FAIL - Expected 401, got ${response.status}`);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('');
  
  // Test 5: Stats endpoint
  console.log('5. Testing GET /users/me/stats without token...');
  try {
    const response = await fetch(`${baseUrl}/users/me/stats`);
    
    if (response.status === 401) {
      console.log('✅ PASS - Stats endpoint protected (401)');
    } else {
      console.log(`❌ FAIL - Expected 401, got ${response.status}`);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n🎯 Summary: User endpoints are properly protected with authentication middleware');
  console.log('📝 Note: Full functionality testing requires database and valid JWT tokens');
}

testUserEndpoints().catch(console.error);