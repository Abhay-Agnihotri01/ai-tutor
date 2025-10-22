# Live Class Integration Examples

Here are practical examples of how to integrate the live class components into your existing application.

## 1. Course Builder Integration (Instructor)

Add live class management to your course builder:

```jsx
// In pages/instructor/CourseBuilder.jsx
import LiveClassManager from '../../components/live/LiveClassManager';

// Add this to your existing tabs or sections
const CourseBuilder = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="course-builder">
      {/* Existing navigation */}
      <nav className="tabs">
        <button onClick={() => setActiveTab('overview')}>Overview</button>
        <button onClick={() => setActiveTab('chapters')}>Chapters</button>
        <button onClick={() => setActiveTab('live-classes')}>Live Classes</button>
        {/* Other tabs */}
      </nav>
      
      {/* Tab content */}
      {activeTab === 'live-classes' && (
        <LiveClassManager courseId={courseId} />
      )}
      {/* Other tab content */}
    </div>
  );
};
```

## 2. Course Learning Integration (Student)

Add live classes to the course learning experience:

```jsx
// In pages/CourseLearn.jsx
import LiveClassList from '../components/live/LiveClassList';

const CourseLearn = () => {
  return (
    <div className="course-learn">
      {/* Existing course content */}
      <div className="course-sidebar">
        {/* Existing sidebar content */}
        
        {/* Add live classes section */}
        <div className="live-classes-section">
          <LiveClassList courseId={courseId} />
        </div>
      </div>
      
      {/* Main content area */}
    </div>
  );
};
```

## 3. Dashboard Integration

Add live class dashboard to main dashboards:

```jsx
// In pages/instructor/InstructorDashboard.jsx
import LiveClassDashboard from '../../components/live/LiveClassDashboard';

const InstructorDashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* Existing dashboard widgets */}
        
        {/* Add live classes widget */}
        <div className="dashboard-widget">
          <LiveClassDashboard />
        </div>
      </div>
    </div>
  );
};
```

## 4. Navigation Integration

Add live class links to your navigation:

```jsx
// In components/layout/Header.jsx
import { Video } from 'lucide-react';

const Header = () => {
  return (
    <nav>
      {/* Existing navigation items */}
      
      {user?.role === 'instructor' && (
        <Link to="/instructor/live-classes" className="nav-link">
          <Video className="w-4 h-4 mr-2" />
          Live Classes
        </Link>
      )}
    </nav>
  );
};
```

## 5. Course Card Integration

Show live class status on course cards:

```jsx
// In components/course/CourseCard.jsx
import { Video } from 'lucide-react';

const CourseCard = ({ course }) => {
  const [hasLiveClass, setHasLiveClass] = useState(false);
  
  useEffect(() => {
    // Check if course has live classes
    checkLiveClasses();
  }, [course.id]);
  
  const checkLiveClasses = async () => {
    try {
      const response = await fetch(`/api/live-classes/course/${course.id}`);
      const data = await response.json();
      const hasLive = data.liveClasses?.some(c => c.status === 'live');
      setHasLiveClass(hasLive);
    } catch (error) {
      console.error('Error checking live classes:', error);
    }
  };
  
  return (
    <div className="course-card">
      {/* Existing course card content */}
      
      {hasLiveClass && (
        <div className="live-indicator">
          <Video className="w-4 h-4 text-red-500" />
          <span className="text-red-500 text-sm">Live Now</span>
        </div>
      )}
    </div>
  );
};
```

## 6. Quick Access Component

Create a floating live class button:

```jsx
// Create components/live/LiveClassQuickAccess.jsx
import { useState, useEffect } from 'react';
import { Video, X } from 'lucide-react';

const LiveClassQuickAccess = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const checkLiveClasses = async () => {
      // Fetch live classes for user
      // Set liveClasses and isVisible
    };
    
    checkLiveClasses();
    const interval = setInterval(checkLiveClasses, 30000);
    return () => clearInterval(interval);
  }, []);
  
  if (!isVisible || liveClasses.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Live Class Available!</span>
          <button onClick={() => setIsVisible(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        {liveClasses.map(liveClass => (
          <button
            key={liveClass.id}
            onClick={() => window.open(liveClass.meetingUrl, '_blank')}
            className="flex items-center space-x-2 text-sm hover:underline"
          >
            <Video className="w-4 h-4" />
            <span>Join "{liveClass.title}"</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Add to App.jsx
import LiveClassQuickAccess from './components/live/LiveClassQuickAccess';

function App() {
  return (
    <div className="app">
      {/* Existing app content */}
      <LiveClassQuickAccess />
    </div>
  );
}
```

## 7. Route Integration

Add live class routes to your router:

```jsx
// In App.jsx
import LiveClassRoom from './components/live/LiveClassRoom';
import LiveClassManager from './components/live/LiveClassManager';

function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        
        {/* Live class routes */}
        <Route path="/live-class/:meetingId" element={<LiveClassRoom />} />
        <Route path="/instructor/live-classes" element={<LiveClassManager />} />
        
        {/* Other routes */}
      </Routes>
    </Router>
  );
}
```

## 8. Notification Integration

Add live class notifications to your notification system:

```jsx
// In context/NotificationContext.jsx or similar
const NotificationContext = () => {
  useEffect(() => {
    // Listen for live class notifications
    const checkUpcomingClasses = async () => {
      // Check for classes starting soon
      // Show notifications
    };
    
    const interval = setInterval(checkUpcomingClasses, 60000);
    return () => clearInterval(interval);
  }, []);
};
```

## 9. Mobile Responsive Integration

Ensure mobile compatibility:

```jsx
// In components/live/LiveClassRoom.jsx
const LiveClassRoom = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className={`live-class-room ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Responsive layout */}
    </div>
  );
};
```

## 10. Analytics Integration

Track live class usage:

```jsx
// In services/analytics.js
export const trackLiveClassEvent = (event, data) => {
  // Track events like:
  // - class_joined
  // - class_left
  // - screen_share_started
  // - chat_message_sent
  
  console.log('Live Class Event:', event, data);
  // Send to your analytics service
};

// Use in components
import { trackLiveClassEvent } from '../services/analytics';

const LiveClassRoom = () => {
  const joinClass = () => {
    // Join logic
    trackLiveClassEvent('class_joined', {
      classId: liveClass.id,
      userId: user.id,
      timestamp: new Date().toISOString()
    });
  };
};
```

These examples show how to seamlessly integrate the live class feature into your existing application structure. Choose the integration points that make sense for your specific use case and user flow.