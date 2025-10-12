const request = require('supertest');
const app = require('./server');

// Test đơn giản để kiểm tra API tin nhắn
describe('API Tin Nhắn - Test Đơn Giản', () => {
  
  test('GET /api/tinnhan/getAll - Lấy tất cả tin nhắn', async () => {
    const response = await request(app)
      .get('/api/tinnhan/getAll')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('message');
    expect(Array.isArray(response.body.data)).toBe(true);
    
    console.log('✅ Test getAll thành công');
    console.log('Response:', JSON.stringify(response.body, null, 2));
  });

  test('GET /api/tinnhan/conversations/test-user - Lấy danh sách cuộc trò chuyện', async () => {
    const response = await request(app)
      .get('/api/tinnhan/conversations/test-user')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    
    console.log('✅ Test conversations thành công');
    console.log('Response:', JSON.stringify(response.body, null, 2));
  });

  test('GET /api/tinnhan/unread/test-user - Đếm tin nhắn chưa đọc', async () => {
    const response = await request(app)
      .get('/api/tinnhan/unread/test-user')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('total_unread');
    expect(response.body.data).toHaveProperty('unread_private');
    expect(response.body.data).toHaveProperty('unread_group');
    
    console.log('✅ Test unread thành công');
    console.log('Response:', JSON.stringify(response.body, null, 2));
  });

});






