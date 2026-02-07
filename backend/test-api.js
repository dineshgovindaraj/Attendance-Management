const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    const response = await axios.get('http://localhost:5000/api/students', { timeout: 5000 });
    console.log('✅ API Response:', response.data);
    console.log('✅ Database is connected and working!');
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running on port 5000');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.error('Request timed out - backend might be waiting for database');
    }
  }
  process.exit(0);
}

testAPI();
