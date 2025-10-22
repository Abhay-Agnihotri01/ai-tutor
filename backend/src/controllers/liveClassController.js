import supabase from '../config/supabase.js';

// Create live class
const createLiveClass = async (req, res) => {
  try {
    const { courseId, chapterId, title, description, scheduledAt, duration, maxParticipants, isRecorded } = req.body;
    const instructorId = req.user.id;

    // Generate meeting ID
    const meetingId = `live-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const meetingUrl = `${process.env.CLIENT_URL}/instructor/live-class/${meetingId}`;

    const { data: liveClass, error } = await supabase
      .from('live_classes')
      .insert({
        courseId,
        chapterId,
        instructorId,
        title,
        description,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration: duration || 60,
        meetingUrl,
        meetingId,
        maxParticipants: maxParticipants || 100,
        isRecorded: isRecorded || false
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Live class scheduled successfully',
      liveClass: {
        ...liveClass,
        studentUrl: `${process.env.CLIENT_URL}/student/live-class/${meetingId}`
      }
    });
  } catch (error) {
    console.error('Error creating live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule live class'
    });
  }
};

// Get live classes for course
const getLiveClasses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query;

    let query = supabase
      .from('live_classes')
      .select('*')
      .eq('courseId', courseId)
      .order('scheduledAt', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: liveClasses, error } = await query;

    if (error) throw error;

    // Get participant count for each live class
    const liveClassesWithParticipants = await Promise.all(
      (liveClasses || []).map(async (liveClass) => {
        const { data: participants } = await supabase
          .from('live_class_participants')
          .select(`
            *,
            users (
              id,
              firstName,
              lastName,
              email
            )
          `)
          .eq('liveClassId', liveClass.id);
        
        return {
          ...liveClass,
          participants: participants || []
        };
      })
    );

    res.json({
      success: true,
      liveClasses: liveClassesWithParticipants
    });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    // If table doesn't exist, return empty array
    if (error.code === 'PGRST116') {
      res.json({
        success: true,
        liveClasses: []
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch live classes'
      });
    }
  }
};

// Get single live class
const getLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Looking for live class with meetingId:', id);

    const { data: liveClass, error } = await supabase
      .from('live_classes')
      .select('*')
      .eq('meetingId', id)
      .single();

    if (error || !liveClass) {
      console.log('Live class not found:', error);
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    console.log('Found live class:', liveClass.id);

    // Get participants separately with user info
    const { data: participants, error: participantsError } = await supabase
      .from('live_class_participants')
      .select(`
        id,
        userId,
        joinedAt,
        leftAt,
        isPresent,
        createdAt
      `)
      .eq('liveClassId', liveClass.id);

    console.log('Participants found:', participants?.length || 0);

    // Get user info for each participant
    const participantsWithUsers = await Promise.all(
      (participants || []).map(async (participant) => {
        const { data: user } = await supabase
          .from('users')
          .select('id, firstName, lastName, email')
          .eq('id', participant.userId)
          .single();
        
        return {
          ...participant,
          user: user || null
        };
      })
    );

    res.json({
      success: true,
      liveClass: {
        ...liveClass,
        participants: participantsWithUsers
      }
    });
  } catch (error) {
    console.error('Error fetching live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live class'
    });
  }
};

// Update live class
const updateLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: liveClass, error } = await supabase
      .from('live_classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      message: 'Live class updated successfully',
      liveClass
    });
  } catch (error) {
    console.error('Error updating live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update live class'
    });
  }
};

// Start live class
const startLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: liveClass, error } = await supabase
      .from('live_classes')
      .update({ status: 'live' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      message: 'Live class started',
      liveClass
    });
  } catch (error) {
    console.error('Error starting live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start live class'
    });
  }
};

// End live class
const endLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { recordingUrl } = req.body;

    const updates = { status: 'ended' };
    if (recordingUrl) {
      updates.recordingUrl = recordingUrl;
    }

    const { data: liveClass, error } = await supabase
      .from('live_classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      message: 'Live class ended',
      liveClass
    });
  } catch (error) {
    console.error('Error ending live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end live class'
    });
  }
};

// Join live class
const joinLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get live class
    const { data: liveClass, error: classError } = await supabase
      .from('live_classes')
      .select('*')
      .eq('id', id)
      .single();

    if (classError || !liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Check if already joined
    const { data: existingParticipant } = await supabase
      .from('live_class_participants')
      .select('*')
      .eq('liveClassId', id)
      .eq('userId', userId)
      .single();

    let participant;
    if (!existingParticipant) {
      const { data, error } = await supabase
        .from('live_class_participants')
        .insert({
          liveClassId: id,
          userId,
          joinedAt: new Date().toISOString(),
          isPresent: true
        })
        .select()
        .single();
      
      if (error) throw error;
      participant = data;
    } else {
      const { data, error } = await supabase
        .from('live_class_participants')
        .update({
          joinedAt: new Date().toISOString(),
          isPresent: true,
          leftAt: null
        })
        .eq('id', existingParticipant.id)
        .select()
        .single();
      
      if (error) throw error;
      participant = data;
    }

    res.json({
      success: true,
      message: 'Joined live class successfully',
      participant,
      meetingUrl: liveClass.meetingUrl
    });
  } catch (error) {
    console.error('Error joining live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join live class'
    });
  }
};

// Leave live class
const leaveLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await supabase
      .from('live_class_participants')
      .update({
        leftAt: new Date().toISOString(),
        isPresent: false
      })
      .eq('liveClassId', id)
      .eq('userId', userId);

    res.json({
      success: true,
      message: 'Left live class successfully'
    });
  } catch (error) {
    console.error('Error leaving live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave live class'
    });
  }
};

// Delete live class
const deleteLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete participants first
    await supabase
      .from('live_class_participants')
      .delete()
      .eq('liveClassId', id);

    // Delete live class
    const { error } = await supabase
      .from('live_classes')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      message: 'Live class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete live class'
    });
  }
};

// WebRTC Signaling endpoints
const sendSignal = async (req, res) => {
  try {
    const { meetingId, fromUserId, toUserId, signal } = req.body;
    
    // Store signal in temporary storage (in production, use Redis)
    const { error } = await supabase
      .from('live_class_signals')
      .insert({
        meetingId,
        fromUserId,
        toUserId,
        signal: JSON.stringify(signal),
        createdAt: new Date().toISOString()
      });
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending signal:', error);
    res.status(500).json({ success: false, message: 'Failed to send signal' });
  }
};

const getSignals = async (req, res) => {
  try {
    const { meetingId, userId } = req.params;
    
    // Get signals for this user
    const { data: signals, error } = await supabase
      .from('live_class_signals')
      .select('*')
      .eq('meetingId', meetingId)
      .eq('toUserId', userId)
      .order('createdAt', { ascending: true });
    
    if (error) throw error;
    
    // Parse signals and delete them (consume once)
    const parsedSignals = (signals || []).map(s => ({
      fromUserId: s.fromUserId,
      signal: JSON.parse(s.signal)
    }));
    
    // Delete consumed signals
    if (signals && signals.length > 0) {
      await supabase
        .from('live_class_signals')
        .delete()
        .in('id', signals.map(s => s.id));
    }
    
    res.json({ success: true, signals: parsedSignals });
  } catch (error) {
    console.error('Error getting signals:', error);
    res.status(500).json({ success: false, message: 'Failed to get signals' });
  }
};

// Upload recording to Cloudinary
const uploadRecording = async (req, res) => {
  try {
    const { recordingUrl, meetingId } = req.body;
    
    // Import cloudinary
    const { v2: cloudinary } = await import('cloudinary');
    
    // Upload to Cloudinary using URL
    const result = await cloudinary.uploader.upload(recordingUrl, {
      resource_type: 'video',
      folder: 'live-class-recordings',
      public_id: `recording-${meetingId}-${Date.now()}`
    });
    
    // Update live class with recording URL
    const { error: updateError } = await supabase
      .from('live_classes')
      .update({ 
        recordingUrl: result.secure_url,
        isRecorded: true 
      })
      .eq('meetingId', meetingId);
    
    if (updateError) throw updateError;
    
    res.json({ 
      success: true, 
      cloudinaryUrl: result.secure_url 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export {
  createLiveClass,
  getLiveClasses,
  getLiveClass,
  updateLiveClass,
  startLiveClass,
  endLiveClass,
  joinLiveClass,
  leaveLiveClass,
  deleteLiveClass,
  sendSignal,
  getSignals,
  uploadRecording
};