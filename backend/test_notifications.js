import NotificationService from './src/notifications/NotificationService.js';

async function testNotifications() {
  try {
    const notificationService = new NotificationService();
    
    // Test getting course students (replace with actual course ID)
    console.log('🧪 Testing notification system...');
    
    // You can test with a real course ID from your database
    const testCourseId = 'your-course-id-here';
    
    console.log('✅ Notification service initialized successfully');
    console.log('📧 Email provider configured for:', process.env.EMAIL_PROVIDER || 'smtp');
    console.log('📬 SMTP configured for:', process.env.SMTP_USER || 'not configured');
    
    console.log('\n🎯 To test notifications:');
    console.log('1. Go to Course Builder page');
    console.log('2. Click "Send Message" in the sidebar');
    console.log('3. Send a test message to enrolled students');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotifications();