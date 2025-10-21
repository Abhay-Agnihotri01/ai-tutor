import supabase from '../config/supabase.js';
import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';

// Generate Certificate
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user completed the course
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('progress')
      .eq('courseId', courseId)
      .eq('userId', userId)
      .single();

    if (!enrollment || enrollment.progress < 100) {
      return res.status(400).json({ message: 'Course not completed yet' });
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (existingCert) {
      return res.json({ success: true, certificate: existingCert });
    }

    // Get course and user details
    const { data: course } = await supabase
      .from('courses')
      .select(`
        *,
        users (firstName, lastName)
      `)
      .eq('id', courseId)
      .single();

    const { data: user } = await supabase
      .from('users')
      .select('firstName, lastName')
      .eq('id', userId)
      .single();

    if (!course || !user) {
      return res.status(404).json({ message: 'Course or user not found' });
    }

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create PDF certificate
    const pdfBuffer = await createCertificatePDF({
      studentName: `${user.firstName} ${user.lastName}`,
      courseName: course.title,
      instructorName: `${course.users.firstName} ${course.users.lastName}`,
      certificateNumber,
      issueDate: new Date().toLocaleDateString()
    });

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'certificates',
          public_id: certificateNumber,
          format: 'pdf'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(pdfBuffer);
    });

    // Save certificate record
    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert({
        course_id: courseId,
        user_id: userId,
        certificate_number: certificateNumber,
        certificate_url: uploadResult.secure_url,
        completion_percentage: enrollment.progress
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, certificate });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get User Certificates
export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: certificates, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (
          title,
          category,
          users (firstName, lastName)
        )
      `)
      .eq('user_id', userId)
      .eq('is_valid', true)
      .order('issued_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, certificates });
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify Certificate
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (
          title,
          category,
          users (firstName, lastName)
        ),
        users (firstName, lastName)
      `)
      .eq('certificate_number', certificateNumber)
      .eq('is_valid', true)
      .single();

    if (error || !certificate) {
      return res.status(404).json({ message: 'Certificate not found or invalid' });
    }

    res.json({ success: true, certificate });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to create PDF certificate
const createCertificatePDF = async ({ studentName, courseName, instructorName, certificateNumber, issueDate }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Certificate design
      doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100).stroke();
      doc.rect(60, 60, doc.page.width - 120, doc.page.height - 120).stroke();

      // Title
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF COMPLETION', 0, 150, { align: 'center' });

      // Subtitle
      doc.fontSize(18)
         .font('Helvetica')
         .text('This is to certify that', 0, 220, { align: 'center' });

      // Student name
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .text(studentName, 0, 260, { align: 'center' });

      // Course completion text
      doc.fontSize(18)
         .font('Helvetica')
         .text('has successfully completed the course', 0, 320, { align: 'center' });

      // Course name
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(courseName, 0, 360, { align: 'center' });

      // Instructor
      doc.fontSize(16)
         .font('Helvetica')
         .text(`Instructor: ${instructorName}`, 0, 420, { align: 'center' });

      // Date and certificate number
      doc.fontSize(12)
         .text(`Issue Date: ${issueDate}`, 100, 480)
         .text(`Certificate Number: ${certificateNumber}`, 100, 500);

      // Signature line
      doc.text('_________________________', 500, 480)
         .text('Authorized Signature', 520, 500);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};