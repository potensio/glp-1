// Simple test to check profile API with existing user
const testProfileAPI = async () => {
  try {
    console.log('Testing profile API...');
    
    // Test with existing user credentials
    const loginResponse = await fetch('http://localhost:3000/handler/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123' // assuming this is the password
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      // Extract cookies from login response
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('Cookies received:', cookies);
      
      // Now test profile API with cookies
      const profileResponse = await fetch('http://localhost:3000/api/profile', {
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      console.log('Profile API response status:', profileResponse.status);
      const profileData = await profileResponse.text();
      console.log('Profile API response:', profileData);
    } else {
      console.log('Login failed');
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

testProfileAPI();