// API Test Script for Admin Dashboard
// Run with: node test-api.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

const testEndpoints = [
  {
    name: 'Users - GetAll',
    url: '/api/nguoidung/getAll',
    method: 'GET'
  },
  {
    name: 'Posts - GetAll', 
    url: '/api/baidang/getAll',
    method: 'GET'
  },
  {
    name: 'Points - GetOverallStats',
    url: '/api/lich_su_tich_diem/getOverallStats',
    method: 'GET'
  },
  {
    name: 'Points - GetHistory',
    url: '/api/lich_su_tich_diem/getAll',
    method: 'GET'
  },
  {
    name: 'Categories - GetAll',
    url: '/api/danhmuc/getAll',
    method: 'GET'
  }
];

async function testAPI() {
  console.log('🔍 Testing Backend API Endpoints...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`📡 Testing: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.method} ${API_BASE_URL}${endpoint.url}`);
      
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE_URL}${endpoint.url}`,
        timeout: 5000
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data: ${Array.isArray(response.data) ? response.data.length + ' items' : 'Object'}`);
      console.log('');
      
      passed++;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   📝 Response: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
      }
      console.log('');
      
      failed++;
    }
  }
  
  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All API tests passed! Admin Dashboard should work correctly.');
  } else {
    console.log('\n⚠️  Some API tests failed. Please check backend server.');
  }
}

// Health check
async function healthCheck() {
  try {
    console.log('🏥 Performing health check...');
    const response = await axios.get(`${API_BASE_URL}/nguoidung/getAll`, { timeout: 3000 });
    console.log('✅ Backend is healthy and responding');
    return true;
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    console.log('💡 Make sure backend is running on http://localhost:3000');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Admin Dashboard API Test Suite\n');
  
  const isHealthy = await healthCheck();
  console.log('');
  
  if (isHealthy) {
    await testAPI();
  } else {
    console.log('❌ Cannot proceed with tests. Backend is not accessible.');
    process.exit(1);
  }
}

main().catch(console.error);
