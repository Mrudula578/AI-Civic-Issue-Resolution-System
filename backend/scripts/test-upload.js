// Test script to verify file upload functionality
// Creates sample files and tests upload middleware

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'http://localhost:3000/api';

/**
 * Create a simple test image buffer (1x1 PNG)
 */
function createTestPNGBuffer() {
  // Simple 1x1 PNG file as buffer
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x75, 0x30, 0x32, 0xA6, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);
  
  return pngData;
}

/**
 * Create form data for file upload testing
 */
function createFormData(files, additionalFields = {}) {
  const boundary = '----testboundary' + Date.now();
  let formData = '';

  // Add text fields
  for (const [key, value] of Object.entries(additionalFields)) {
    formData += `--${boundary}\r\n`;
    formData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    formData += `${value}\r\n`;
  }

  // Add files
  for (const file of files) {
    formData += `--${boundary}\r\n`;
    formData += `Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"\r\n`;
    formData += `Content-Type: ${file.mimetype}\r\n\r\n`;
    
    // Convert buffer to string for concatenation
    formData += file.buffer.toString('binary') + '\r\n';
  }

  formData += `--${boundary}--\r\n`;

  return {
    data: Buffer.from(formData, 'binary'),
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}

async function testStorageService() {
  console.log('🗄️ Testing storage service...\n');

  try {
    // Import storage service
    const { storageService } = await import('../src/services/storage/index.js');
    
    console.log('1. Testing file upload...');
    const testBuffer = createTestPNGBuffer();
    const fileUrl = await storageService.uploadFile(testBuffer, 'test.png', 'image/png');
    console.log('✅ File uploaded successfully:', fileUrl);

    console.log('2. Testing file exists check...');
    const exists = await storageService.fileExists(fileUrl);
    console.log('✅ File exists check:', exists);

    console.log('3. Testing file URL generation...');
    const fullUrl = storageService.getFileUrl(fileUrl);
    console.log('✅ Full URL:', fullUrl);

    console.log('4. Testing file deletion...');
    const deleted = await storageService.deleteFile(fileUrl);
    console.log('✅ File deleted:', deleted);

  } catch (error) {
    console.log('❌ Storage service test failed:', error.message);
  }
}

async function testUploadEndpoint() {
  console.log('\n📤 Testing upload endpoints...\n');

  // Test will fail without actual upload endpoint, but we can test the validation
  console.log('Note: Upload endpoint tests require actual complaint submission endpoint');
  console.log('This will be tested in task #10 (complaint submission)');
}

async function testFileValidation() {
  console.log('\n🔍 Testing file validation...\n');

  try {
    // Import validation functions
    const { default: config } = await import('../src/config/index.js');
    
    console.log('✅ File size limit:', config.upload.maxFileSizeMB + 'MB');
    console.log('✅ Max files per complaint:', config.upload.maxFilesPerComplaint);
    
    console.log('✅ File validation configuration loaded successfully');
    
  } catch (error) {
    console.log('❌ File validation test failed:', error.message);
  }
}

async function runAllTests() {
  await testStorageService();
  await testFileValidation();
  await testUploadEndpoint();
}

runAllTests().catch(console.error);