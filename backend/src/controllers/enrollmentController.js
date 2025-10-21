import supabase from '../config/supabase.js';

export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('userId', userId)
      .eq('courseId', courseId)
      .single();

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Verify course exists and is published
    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('isPublished', true)
      .single();
      
    if (!course) {
      return res.status(404).json({ message: 'Course not found or not published' });
    }

    // Calculate actual price paid (use discount price if available)
    const actualPrice = course.discountPrice || course.price || 0;
    
    // Create enrollment with actual price paid
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        userId,
        courseId,
        progress: 0,
        pricePaid: actualPrice,
        enrolledAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      enrollment,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          *,
          users!courses_instructorId_fkey (
            firstName,
            lastName,
            avatar
          )
        )
      `)
      .eq('userId', userId)
      .order('enrolledAt', { ascending: false });

    if (error) throw error;

    // Format the response to match expected structure
    const enrollmentsWithCourses = enrollments.map(enrollment => ({
      ...enrollment,
      Course: enrollment.courses ? {
        ...enrollment.courses,
        instructor: enrollment.courses.users
      } : null
    }));

    res.json({
      success: true,
      enrollments: enrollmentsWithCourses
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markVideoComplete = async (req, res) => {
  try {
    const { videoId, courseId } = req.body;
    const userId = req.user.id;

    // Check if already completed
    const { data: existing } = await supabase
      .from('video_progress')
      .select('*')
      .eq('userId', userId)
      .eq('videoId', videoId)
      .single();

    if (!existing) {
      // Mark video as completed
      await supabase
        .from('video_progress')
        .insert({
          userId,
          videoId,
          courseId,
          completed: true,
          completedAt: new Date().toISOString()
        });
    }

    // Calculate overall course progress
    const { data: courseVideos } = await supabase
      .from('videos')
      .select('id')
      .eq('chapterId', 'in', `(
        SELECT id FROM chapters WHERE "courseId" = '${courseId}'
      )`);

    const { data: completedVideos } = await supabase
      .from('video_progress')
      .select('videoId')
      .eq('userId', userId)
      .eq('courseId', courseId)
      .eq('completed', true);

    const totalVideos = courseVideos?.length || 1;
    const completedCount = completedVideos?.length || 0;
    const progress = Math.round((completedCount / totalVideos) * 100);

    // Update enrollment progress
    await supabase
      .from('enrollments')
      .update({ progress })
      .eq('userId', userId)
      .eq('courseId', courseId);

    res.json({ success: true, progress });
  } catch (error) {
    console.error('Mark video complete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getVideoProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const { data: progress } = await supabase
      .from('video_progress')
      .select('videoId, completed')
      .eq('userId', userId)
      .eq('courseId', courseId);

    res.json({ success: true, progress: progress || [] });
  } catch (error) {
    console.error('Get video progress error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { courseId, lessonId, progress } = req.body;
    const userId = req.user.id;

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('userId', userId)
      .eq('courseId', courseId)
      .single();

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const { data: updatedEnrollment, error } = await supabase
      .from('enrollments')
      .update({
        progress: progress || enrollment.progress
      })
      .eq('userId', userId)
      .eq('courseId', courseId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      enrollment: updatedEnrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};