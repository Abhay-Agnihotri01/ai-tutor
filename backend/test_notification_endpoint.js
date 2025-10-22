import fetch from 'node-fetch';

async function testNotificationEndpoint() {
  try {
    console.log('🧪 Testing notification endpoint...');
    
    // Test basic server health
    const healthResponse = await fetch('http://192.168.1.8:5000/api/health');
    if (healthResponse.ok) {
      console.log('✅ Server is running and accessible');
    } else {
      console.log('❌ Server health check failed');
      return;
    }
    
    // Test notification endpoint without auth (should get 401)
    const notificationResponse = await fetch('http://192.168.1.8:5000/api/notifications/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courseId: 'test',
        subject: 'Test',
        message: 'Test message'
      })
    });
    
    console.log('📡 Notification endpoint status:', notificationResponse.status);
    const responseText = await notificationResponse.text();
    console.log('📄 Response:', responseText);
    
    if (notificationResponse.status === 401) {
      console.log('✅ Endpoint exists but requires authentication (expected)');
    } else if (notificationResponse.status === 404) {
      console.log('❌ Notification endpoint not found - route registration issue');
    } else {
      console.log('⚠️ Unexpected response status');
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('💡 Possible issues:');
    console.log('   - Server not running on 192.168.1.8:5000');
    console.log('   - Firewall blocking connections');
    console.log('   - Network configuration issue');
  }
}

testNotificationEndpoint();