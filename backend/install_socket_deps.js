// Install Socket.IO dependencies
import { execSync } from 'child_process';

console.log('Installing Socket.IO dependencies...');

try {
  execSync('npm install socket.io@^4.7.5', { stdio: 'inherit' });
  console.log('✅ Socket.IO installed successfully');
} catch (error) {
  console.error('❌ Failed to install Socket.IO:', error.message);
  process.exit(1);
}