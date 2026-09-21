import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function testCategoriesEndpoints() {
  console.log('🧪 Testing Categories Endpoints\n');

  try {
    // Test 1: Get all categories
    console.log('1️⃣ Testing GET /api/categories');
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      console.log('✅ Success:', response.status);
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Search categories
    console.log('2️⃣ Testing GET /api/categories?search=pot');
    try {
      const response = await axios.get(`${API_BASE}/categories?search=pot`);
      console.log('✅ Success:', response.status);
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Get category stats
    console.log('3️⃣ Testing GET /api/categories/stats');
    try {
      const response = await axios.get(`${API_BASE}/categories/stats`);
      console.log('✅ Success:', response.status);
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Get specific category (we'll use a dummy UUID)
    console.log('4️⃣ Testing GET /api/categories/:id');
    try {
      const dummyId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await axios.get(`${API_BASE}/categories/${dummyId}`);
      console.log('✅ Success:', response.status);
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

testCategoriesEndpoints();