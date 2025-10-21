import { useState } from 'react';
import { X, Save, Download } from 'lucide-react';
import Button from './Button';
import { toast } from 'react-hot-toast';

const PDFViewer = ({ submission, onClose, onGradeSubmit }) => {
  const [gradeForm, setGradeForm] = useState({
    score: submission.score || '',
    feedback: submission.feedback || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitGrade = async () => {
    if (!gradeForm.score || gradeForm.score < 0) {
      toast.error('Please enter a valid score');
      return;
    }

    setIsSubmitting(true);
    try {
      await onGradeSubmit(submission.id, {
        score: parseInt(gradeForm.score),
        feedback: gradeForm.feedback
      });
      onClose();
    } catch (error) {
      toast.error('Failed to submit grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex z-50">
      {/* PDF Viewer */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold">
            Assignment: {submission.users?.firstName || 'Unknown'} {submission.users?.lastName || 'User'}
          </h3>
          <div className="flex items-center space-x-2">
            <a
              href={`http://localhost:5000${submission.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-100">
          <iframe
            src={`http://localhost:5000${submission.fileUrl}`}
            className="w-full h-full border-none"
            title="Assignment PDF"
          />
        </div>
      </div>

      {/* Grading Panel */}
      <div className="w-80 theme-bg-primary border-l theme-border flex flex-col">
        <div className="p-4 border-b theme-border">
          <h4 className="text-lg font-semibold theme-text-primary">Grade Assignment</h4>
          <p className="text-sm theme-text-secondary">
            Submitted: {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              Score (out of {submission.totalMarks || submission.totalPoints || 100})
            </label>
            <input
              type="number"
              min="0"
              max={submission.totalMarks || submission.totalPoints || 100}
              value={gradeForm.score}
              onChange={(e) => setGradeForm(prev => ({ ...prev, score: e.target.value }))}
              className="w-full px-3 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter score"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              Feedback
            </label>
            <textarea
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
              rows={8}
              className="w-full px-3 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Provide feedback to the student..."
            />
          </div>
        </div>

        <div className="p-4 border-t theme-border space-y-3">
          <Button
            onClick={handleSubmitGrade}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Submit Grade
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;