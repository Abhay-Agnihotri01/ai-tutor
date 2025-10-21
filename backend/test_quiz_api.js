// Test script to check quiz API
import fetch from 'node-fetch';

const QUIZ_ID = '5add19a4-5b13-4def-ad11-9aade1abb197';
const API_URL = `http://localhost:5000/api/quiz/${QUIZ_ID}`;

console.log('🔥 Testing quiz API:', API_URL);

try {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
    }
  });
  
  const data = await response.json();
  console.log('📊 API Response:', JSON.stringify(data, null, 2));
  
  if (data.success && data.quiz) {
    console.log('✅ Quiz found');
    console.log('📝 Quiz ID:', data.quiz.id);
    console.log('📝 Quiz Title:', data.quiz.title);
    console.log('📝 Quiz Type:', data.quiz.type);
    console.log('📝 Raw quiz_questions:', data.quiz.quiz_questions);
    console.log('📝 Transformed questions:', data.quiz.questions);
    console.log('📊 Questions count:', data.quiz.questions?.length || 0);
  } else {
    console.log('❌ Quiz not found or error');
  }
} catch (error) {
  console.error('💥 Error:', error);
}