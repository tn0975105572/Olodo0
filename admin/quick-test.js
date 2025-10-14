// Quick API Test - Run with: node quick-test.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function quickTest() {
  console.log('🚀 Quick API Test\n');
  
  const endpoints = [
    '/api/nguoidung/getAll',
    '/api/baidang/getAll', 
    '/api/lich_su_tich_diem/getOverallStats'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { timeout: 3000 });
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data: ${Array.isArray(response.data) ? response.data.length + ' items' : 'Object'}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
      }
    }
    console.log('');
  }
  
  console.log('🎯 Test completed!');
}

quickTest().catch(console.error);



