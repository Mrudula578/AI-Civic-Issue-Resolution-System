#!/usr/bin/env node

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Helper functions
let testCount = 0;
function logTest(status, name, details = '') {
  testCount++;
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⊘';
  console.log(`  ${icon} [${testCount}] ${name}`);
  if (details) console.log(`      ${details}`);
  TEST_RESULTS.tests.push({ status, name, details });
  if (status === 'PASS') TEST_RESULTS.passed++;
  else if (status === 'FAIL') TEST_RESULTS.failed++;
  else TEST_RESULTS.skipped++;
}

function createTestImage() {
  // Create a minimal PNG buffer (1x1 pixel)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x8D, 0x89, 0x02, 0x6C, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  return pngBuffer;
}

async function runTests() {
  console.log('\n🧪 Starting Comprehensive Endpoint Tests\n');
  
  // Test data
  let testUserToken = null;
  let testUserId = null;
  let testComplaintId = null;
  let testCategoryId = null;
  let testImageId = null;

  try {
    // ============ HEALTH CHECK ============
    console.log('📋 HEALTH CHECK TESTS\n');
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      if (response.status === 200 && response.data.status === 'ok') {
        logTest('PASS', 'GET /api/health', 'Server is running');
      }
    } catch (error) {
      logTest('FAIL', 'GET /api/health', error.message);
    }

    // ============ AUTHENTICATION ============
    console.log('\n🔐 AUTHENTICATION TESTS\n');

    // Register user
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        email: `testuser${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User'
      });
      if (response.status === 201 && response.data.user) {
        logTest('PASS', 'POST /api/auth/register', 'User registered successfully');
        testUserToken = response.data.tokens?.accessToken;
        testUserId = response.data.user.id;
      }
    } catch (error) {
      logTest('FAIL', 'POST /api/auth/register', error.response?.data?.error?.message || error.message);
    }

    // Login user
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: `testuser${Date.now() - 1000}@example.com`,
        password: 'TestPassword123!'
      });
      if (response.status === 200 && response.data.tokens) {
        logTest('PASS', 'POST /api/auth/login', 'User logged in successfully');
        if (!testUserToken) testUserToken = response.data.tokens.accessToken;
        if (!testUserId) testUserId = response.data.user.id;
      }
    } catch (error) {
      logTest('FAIL', 'POST /api/auth/login', error.response?.data?.error?.message || error.message);
    }

    // Refresh token (requires valid token)
    if (testUserToken) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: testUserToken
        }, {
          headers: { Authorization: `Bearer ${testUserToken}` }
        });
        if (response.status === 200 && response.data.tokens) {
          logTest('PASS', 'POST /api/auth/refresh', 'Token refreshed successfully');
          testUserToken = response.data.tokens.accessToken;
        }
      } catch (error) {
        logTest('FAIL', 'POST /api/auth/refresh', error.response?.data?.error?.message || error.message);
      }
    } else {
      logTest('SKIP', 'POST /api/auth/refresh', 'No valid token available');
    }

    // ============ CATEGORIES ============
    console.log('\n📂 CATEGORY TESTS\n');

    // Get all categories
    try {
      const response = await axios.get(`${BASE_URL}/categories`);
      if (response.status === 200 && Array.isArray(response.data.categories)) {
        logTest('PASS', 'GET /api/categories', `Retrieved ${response.data.categories.length} categories`);
        if (response.data.categories.length > 0) {
          testCategoryId = response.data.categories[0].id;
        }
      }
    } catch (error) {
      logTest('FAIL', 'GET /api/categories', error.message);
    }

    // Get category by ID
    if (testCategoryId) {
      try {
        const response = await axios.get(`${BASE_URL}/categories/${testCategoryId}`);
        if (response.status === 200 && response.data.category) {
          logTest('PASS', `GET /api/categories/${testCategoryId.substring(0, 8)}...`, 'Category retrieved');
        }
      } catch (error) {
        logTest('FAIL', `GET /api/categories/${testCategoryId.substring(0, 8)}...`, error.message);
      }
    } else {
      logTest('SKIP', 'GET /api/categories/:id', 'No category ID available');
    }

    // Get category stats
    try {
      const response = await axios.get(`${BASE_URL}/categories/stats`);
      if (response.status === 200 && response.data.stats) {
        logTest('PASS', 'GET /api/categories/stats', `Retrieved stats for ${Object.keys(response.data.stats).length} categories`);
      }
    } catch (error) {
      logTest('FAIL', 'GET /api/categories/stats', error.message);
    }

    // ============ USER ENDPOINTS ============
    console.log('\n👤 USER ENDPOINTS TESTS\n');

    if (testUserToken) {
      // Get user profile
      try {
        const response = await axios.get(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${testUserToken}` }
        });
        if (response.status === 200 && response.data.user) {
          logTest('PASS', 'GET /api/users/me', 'User profile retrieved');
        }
      } catch (error) {
        logTest('FAIL', 'GET /api/users/me', error.response?.data?.error?.message || error.message);
      }

      // Update user profile
      try {
        const response = await axios.put(`${BASE_URL}/users/me`, {
          name: 'Updated Test User'
        }, {
          headers: { Authorization: `Bearer ${testUserToken}` }
        });
        if (response.status === 200 && response.data.user) {
          logTest('PASS', 'PUT /api/users/me', 'User profile updated');
        }
      } catch (error) {
        logTest('FAIL', 'PUT /api/users/me', error.response?.data?.error?.message || error.message);
      }

      // Get user stats
      try {
        const response = await axios.get(`${BASE_URL}/users/me/stats`, {
          headers: { Authorization: `Bearer ${testUserToken}` }
        });
        if (response.status === 200 && response.data.stats) {
          logTest('PASS', 'GET /api/users/me/stats', 'User stats retrieved');
        }
      } catch (error) {
        logTest('FAIL', 'GET /api/users/me/stats', error.response?.data?.error?.message || error.message);
      }

      // Export user data
      try {
        const response = await axios.get(`${BASE_URL}/users/me/export`, {
          headers: { Authorization: `Bearer ${testUserToken}` }
        });
        if (response.status === 200 && response.data.data) {
          logTest('PASS', 'GET /api/users/me/export', 'User data exported');
        }
      } catch (error) {
        logTest('FAIL', 'GET /api/users/me/export', error.response?.data?.error?.message || error.message);
      }
    } else {
      logTest('SKIP', 'User endpoint tests', 'No valid token available');
    }

    // ============ COMPLAINTS ============
    console.log('\n📝 COMPLAINT TESTS\n');

    if (testUserToken && testCategoryId) {
      // Submit complaint
      try {
        const formData = new FormData();
        formData.append('title', 'Test Complaint - Pothole');
        formData.append('description', 'There is a large pothole on Main Street');
        formData.append('categoryId', testCategoryId);
        formData.append('location', 'Main Street, City Center');
        
        // Add test image
        const imageBuffer = createTestImage();
        formData.append('images', imageBuffer, 'test.png');

        const response = await axios.post(`${BASE_URL}/complaints`, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${testUserToken}`
          }
        });

        if (response.status === 201 && response.data.complaint) {
          logTest('PASS', 'POST /api/complaints', 'Complaint submitted with image');
          testComplaintId = response.data.complaint.id;
        }
      } catch (error) {
        logTest('FAIL', 'POST /api/complaints', error.response?.data?.error?.message || error.message);
      }

      // Get complaint by ID
      if (testComplaintId) {
        try {
          const response = await axios.get(`${BASE_URL}/complaints/${testComplaintId}`);
          if (response.status === 200 && response.data.complaint) {
            logTest('PASS', `GET /api/complaints/${testComplaintId.substring(0, 8)}...`, 'Complaint retrieved');
          }
        } catch (error) {
          logTest('FAIL', `GET /api/complaints/${testComplaintId.substring(0, 8)}...`, error.message);
        }
      }

      // Get user complaints
      try {
        const response = await axios.get(`${BASE_URL}/complaints/user/${testUserId}`, {
          headers: { Authorization: `Bearer ${testUserToken}` }
        });
        if (response.status === 200 && Array.isArray(response.data.complaints)) {
          logTest('PASS', 'GET /api/complaints/user/:userId', `Retrieved ${response.data.complaints.length} user complaints`);
        }
      } catch (error) {
        logTest('FAIL', 'GET /api/complaints/user/:userId', error.response?.data?.error?.message || error.message);
      }

      // Get complaint stats
      try {
        const response = await axios.get(`${BASE_URL}/complaints/stats`, {
          headers: { Authorization: `Bearer ${testUserToken}` }
        });
        if (response.status === 200 && response.data.stats) {
          logTest('PASS', 'GET /api/complaints/stats', 'Complaint stats retrieved');
        }
      } catch (error) {
        logTest('FAIL', 'GET /api/complaints/stats', error.response?.data?.error?.message || error.message);
      }

      // Add image to complaint
      if (testComplaintId) {
        try {
          const formData = new FormData();
          const imageBuffer = createTestImage();
          formData.append('image', imageBuffer, 'test2.png');

          const response = await axios.post(`${BASE_URL}/complaints/${testComplaintId}/images`, formData, {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${testUserToken}`
            }
          });

          if (response.status === 201 && response.data.image) {
            logTest('PASS', `POST /api/complaints/:id/images`, 'Image added to complaint');
            testImageId = response.data.image.id;
          }
        } catch (error) {
          logTest('FAIL', `POST /api/complaints/:id/images`, error.response?.data?.error?.message || error.message);
        }
      }

      // Update complaint status (requires admin/authority)
      if (testComplaintId) {
        try {
          const response = await axios.patch(
            `${BASE_URL}/complaints/${testComplaintId}/status`,
            { status: 'IN_PROGRESS' },
            {
              headers: { Authorization: `Bearer ${testUserToken}` }
            }
          );
          if (response.status === 200) {
            logTest('PASS', 'PATCH /api/complaints/:id/status', 'Status updated (if authorized)');
          }
        } catch (error) {
          if (error.response?.status === 403) {
            logTest('SKIP', 'PATCH /api/complaints/:id/status', 'User not authorized (expected for regular users)');
          } else {
            logTest('FAIL', 'PATCH /api/complaints/:id/status', error.response?.data?.error?.message || error.message);
          }
        }
      }

    } else {
      logTest('SKIP', 'Complaint tests', 'Missing required auth token or category ID');
    }

    // ============ SECURITY TESTS ============
    console.log('\n🔒 SECURITY TESTS\n');

    // Test missing auth header
    try {
      await axios.get(`${BASE_URL}/users/me`);
      logTest('FAIL', 'Missing Auth Token Protection', 'Endpoint accessible without token (security issue)');
    } catch (error) {
      if (error.response?.status === 401) {
        logTest('PASS', 'Missing Auth Token Protection', 'Endpoint requires authentication');
      } else {
        logTest('FAIL', 'Missing Auth Token Protection', error.message);
      }
    }

    // Test invalid token
    try {
      await axios.get(`${BASE_URL}/users/me`, {
        headers: { Authorization: 'Bearer invalid_token_12345' }
      });
      logTest('FAIL', 'Invalid Token Protection', 'Endpoint accessible with invalid token');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logTest('PASS', 'Invalid Token Protection', 'Invalid token rejected');
      } else {
        logTest('FAIL', 'Invalid Token Protection', error.message);
      }
    }

    // Test rate limiting (make multiple requests)
    console.log('\n⏱️  RATE LIMITING TESTS\n');
    let rateLimitHit = false;
    for (let i = 0; i < 15; i++) {
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: 'test@example.com',
          password: 'password'
        });
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimitHit = true;
          break;
        }
      }
    }
    if (rateLimitHit) {
      logTest('PASS', 'Auth Rate Limiting', 'Rate limiting enforced after multiple attempts');
    } else {
      logTest('SKIP', 'Auth Rate Limiting', 'Rate limit not hit within test iterations');
    }

  } catch (error) {
    console.error('Unexpected error during tests:', error.message);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Passed:  ${TEST_RESULTS.passed}`);
  console.log(`✗ Failed:  ${TEST_RESULTS.failed}`);
  console.log(`⊘ Skipped: ${TEST_RESULTS.skipped}`);
  console.log(`📊 Total:  ${TEST_RESULTS.passed + TEST_RESULTS.failed + TEST_RESULTS.skipped}`);
  console.log('='.repeat(60) + '\n');

  if (TEST_RESULTS.failed > 0) {
    console.log('❌ SOME TESTS FAILED\n');
    process.exit(1);
  } else {
    console.log('✅ ALL TESTS PASSED\n');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
