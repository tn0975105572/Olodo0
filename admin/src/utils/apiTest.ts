import { userAPI, postAPI, pointsAPI } from '../services/api';

// Test API connection
export const testApiConnection = async () => {
  console.log('🔍 Testing API connection...');
  
  try {
    // Test users API
    console.log('📊 Testing users API...');
    const usersResponse = await userAPI.getAll();
    console.log('✅ Users API:', usersResponse.data?.length || 0, 'users found');
    
    // Test posts API
    console.log('📝 Testing posts API...');
    const postsResponse = await postAPI.getAll();
    console.log('✅ Posts API:', postsResponse.data?.length || 0, 'posts found');
    
    // Test points API
    console.log('⭐ Testing points API...');
    const pointsResponse = await pointsAPI.getOverallStats();
    console.log('✅ Points API:', pointsResponse.data);
    
    console.log('🎉 All API tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
};

// Test specific endpoints
export const testSpecificEndpoints = async () => {
  const tests = [
    {
      name: 'Users - GetAll',
      test: () => userAPI.getAll(),
    },
    {
      name: 'Posts - GetAll',
      test: () => postAPI.getAll(),
    },
    {
      name: 'Points - GetOverallStats',
      test: () => pointsAPI.getOverallStats(),
    },
    {
      name: 'Points - GetHistory',
      test: () => pointsAPI.getHistory(),
    },
  ];

  console.log('🧪 Running specific endpoint tests...');
  
  for (const test of tests) {
    try {
      const response = await test.test();
      console.log(`✅ ${test.name}:`, response.status, response.data);
    } catch (error) {
      console.error(`❌ ${test.name}:`, error);
    }
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/nguoidung/getAll');
    if (response.ok) {
      console.log('✅ Backend is healthy');
      return true;
    } else {
      console.log('❌ Backend health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend is not reachable:', error);
    return false;
  }
};



