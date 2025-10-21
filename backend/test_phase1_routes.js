import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'your_test_token_here'; // Replace with actual token

const testRoutes = [
  // Quiz routes
  { method: 'GET', url: `${BASE_URL}/quiz/chapter/test-chapter-id`, description: 'Get quizzes by chapter' },
  { method: 'GET', url: `${BASE_URL}/quiz/attempt/status/test-quiz-id`, description: 'Get quiz attempt status' },
  
  // Review routes
  { method: 'GET', url: `${BASE_URL}/reviews/course/test-course-id`, description: 'Get course reviews' },
  
  // Q&A routes
  { method: 'GET', url: `${BASE_URL}/qa/course/test-course-id`, description: 'Get course questions' },
  
  // Certificate routes
  { method: 'GET', url: `${BASE_URL}/certificates/verify/test-cert-number`, description: 'Verify certificate' }
];

async function testPhase1Routes() {
  console.log('🧪 Testing Phase 1 Routes...\n');
  
  for (const route of testRoutes) {
    try {
      const config = {
        method: route.method,
        url: route.url,
        timeout: 5000
      };
      
      if (route.url.includes('/attempt/status/') || route.url.includes('/user')) {
        config.headers = { 'Authorization': `Bearer ${TEST_TOKEN}` };
      }
      
      const response = await axios(config);
      console.log(`✅ ${route.description}: ${response.status}`);
    } catch (error) {
      const status = error.response?.status || 'NETWORK_ERROR';
      const message = error.response?.data?.message || error.message;
      
      if (status === 404) {
        console.log(`❌ ${route.description}: Route not found (404)`);
      } else if (status === 401 || status === 403) {
        console.log(`🔒 ${route.description}: Auth required (${status})`);
      } else if (status === 500) {
        console.log(`⚠️  ${route.description}: Server error - ${message}`);
      } else {
        console.log(`⚠️  ${route.description}: ${status} - ${message}`);
      }
    }
  }
  
  console.log('\n📋 Test completed. Routes returning 404 need to be implemented.');
}

testPhase1Routes();