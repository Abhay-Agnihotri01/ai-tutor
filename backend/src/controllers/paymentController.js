import Razorpay from 'razorpay';
import crypto from 'crypto';
// Removed Sequelize import
import supabase from '../config/supabase.js';

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (error) {
      return res.status(500).json({ message: 'Payment gateway not configured', error: error.message });
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('userId', userId)
      .eq('courseId', courseId)
      .single();

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // For free courses, enroll directly
    const finalPrice = course.discountPrice !== null ? course.discountPrice : course.price;
    const numericPrice = parseFloat(finalPrice);

    if (numericPrice === 0) {
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          userId,
          courseId,
          progress: 0
        })
        .select()
        .single();

      if (enrollError) throw enrollError;

      return res.json({
        success: true,
        enrollment,
        message: 'Enrolled in free course successfully'
      });
    }

    // Create Razorpay order
    const amount = Math.round((course.discountPrice || course.price) * 100);
    const options = {
      amount,
      currency: 'INR',
      receipt: `course_${Date.now()}`,
      notes: {
        courseId,
        userId,
        courseTitle: course.title
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        courseId,
        courseTitle: course.title,
        coursePrice: course.discountPrice || course.price
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId
    } = req.body;
    const userId = req.user.id;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Get payment details from Razorpay
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ message: 'Payment not captured' });
    }

    // Check if already enrolled (double-check)
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('userId', userId)
      .eq('courseId', courseId)
      .single();

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        userId,
        courseId,
        progress: 0
      })
      .select()
      .single();

    if (enrollError) throw enrollError;

    res.json({
      success: true,
      enrollment,
      message: 'Payment verified and enrollment completed successfully'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses(title, thumbnail, price, discountPrice)
      `)
      .eq('userId', userId)
      .order('enrolledAt', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      payments: enrollments.map(enrollment => ({
        id: enrollment.id,
        course: enrollment.courses,
        enrolledAt: enrollment.enrolledAt
      }))
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
  }
};