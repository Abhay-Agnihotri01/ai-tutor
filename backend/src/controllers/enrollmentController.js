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

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        userId,
        courseId,
        progress: 0
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