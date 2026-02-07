const axios = require('axios');

async function testAddStudent() {
  try {
    console.log('Testing Add Student API...');
    const newStudent = {
      name: 'Test Student',
      regNo: 'TEST001',
      dob: '2004-01-01',
      class: '3 year',
      section: 'A'
    };
    
    const response = await axios.post('http://localhost:5000/api/students', newStudent, { timeout: 5000 });
    console.log('✅ Student Added Successfully!');
    console.log('Response:', response.data);
    
    // Now fetch all students to verify
    const getResponse = await axios.get('http://localhost:5000/api/students', { timeout: 5000 });
    console.log(`\n✅ Total students in database: ${getResponse.data.length}`);
    console.log('Last student:', getResponse.data[getResponse.data.length - 1]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
  process.exit(0);
}

testAddStudent();
