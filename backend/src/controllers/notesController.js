import supabase from '../config/supabase.js';

export const createNote = async (req, res) => {
  try {
    const { videoId, courseId, type, content, timestamp, textLectureId } = req.body;
    const userId = req.user.id;

    console.log('Creating note:', { videoId, textLectureId, courseId, type, userId });

    const { data: note, error } = await supabase
      .from('student_notes')
      .insert({
        "userId": userId,
        "videoId": videoId || null,
        "courseId": courseId,
        "textLectureId": textLectureId || null,
        type,
        content,
        timestamp: timestamp || 0,
        "createdAt": new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    console.log('Note created successfully:', note.id);
    res.json({ success: true, note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Failed to save note', error: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const { data: notes, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('"userId"', userId)
      .eq('"videoId"', videoId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    res.json({ success: true, notes: notes || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load notes', error: error.message });
  }
};

export const getTextLectureNotes = async (req, res) => {
  try {
    const { textLectureId } = req.params;
    const userId = req.user.id;

    console.log('Getting text lecture notes for:', { textLectureId, userId });

    const { data: notes, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('"userId"', userId)
      .eq('"textLectureId"', textLectureId)
      .order('"createdAt"', { ascending: false });

    if (error) {
      console.error('Error getting text lecture notes:', error);
      throw error;
    }

    console.log('Found text lecture notes:', notes?.length || 0);
    res.json({ success: true, notes: notes || [] });
  } catch (error) {
    console.error('Text lecture notes error:', error);
    res.status(500).json({ message: 'Failed to load text lecture notes', error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('student_notes')
      .delete()
      .eq('id', noteId)
      .eq('"userId"', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
};

export const getCourseNotes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const { data: notes, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('"userId"', userId)
      .eq('"courseId"', courseId)
      .order('"createdAt"', { ascending: false });

    if (error) throw error;

    res.json({ success: true, notes: notes || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load course notes', error: error.message });
  }
};

export const getCourseTextLectureNotes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const { data: notes, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('"userId"', userId)
      .eq('"courseId"', courseId)
      .is('"videoId"', null)
      .not('"textLectureId"', 'is', null)
      .order('"createdAt"', { ascending: false });

    if (error) throw error;

    res.json({ success: true, notes: notes || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load course text lecture notes', error: error.message });
  }
};

export const getChapterNotes = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.id;

    // First get all videos in this chapter
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id')
      .eq('"chapterId"', chapterId);

    if (videosError) throw videosError;

    if (!videos || videos.length === 0) {
      return res.json({ success: true, notes: [] });
    }

    const videoIds = videos.map(v => v.id);

    // Get notes for all videos in this chapter
    const { data: notes, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('"userId"', userId)
      .in('"videoId"', videoIds)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    res.json({ success: true, notes: notes || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load chapter notes', error: error.message });
  }
};