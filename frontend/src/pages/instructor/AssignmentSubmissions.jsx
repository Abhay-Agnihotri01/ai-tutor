import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import PDFViewer from '../../components/common/PDFViewer';

const AssignmentSubmissions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [viewingSubmission, setViewingSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [quizId]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view submissions');
        navigate('/login');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/quiz/submissions/${quizId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
        // Get quiz info from first submission or fetch separately
        if (data.submissions.length > 0) {
          setQuiz({ 
            title: 'Assignment', 
            totalMarks: data.submissions[0].totalMarks || 100,
            courseId: data.submissions[0].courseId
          });
        }
      } else {
        throw new Error('Failed to fetch submissions');
      }
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const startGrading = (submission) => {
    setGradingSubmission(submission);
    setGradeForm({
      score: submission.score || '',
      feedback: submission.feedback || ''
    });
  };

  const submitGrade = async (submissionId, gradeData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to submit grades');
      navigate('/login');
      return;
    }
    
    const response = await fetch(`http://localhost:5000/api/quiz/grade/${submissionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gradeData)
    });

    if (response.status === 401) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    
    if (response.ok) {
      toast.success('Grade submitted successfully');
      setGradingSubmission(null);
      setGradeForm({ score: '', feedback: '' });
      fetchSubmissions(); // Refresh submissions
    } else {
      throw new Error('Failed to submit grade');
    }
  };

  const submitGradeModal = async () => {
    if (!gradeForm.score || gradeForm.score < 0) {
      toast.error('Please enter a valid score');
      return;
    }

    try {
      await submitGrade(gradingSubmission.id, {
        score: parseInt(gradeForm.score),
        feedback: gradeForm.feedback
      });
    } catch (error) {
      toast.error('Failed to submit grade');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => {
                // Close the current tab and return to the previous tab
                window.close();
              }}
              className="mr-4 p-2 hover:theme-bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 theme-text-primary" />
            </button>
            <div>
              <h1 className="text-3xl font-bold theme-text-primary">Assignment Submissions</h1>
              <p className="theme-text-secondary">{submissions.length} submissions received</p>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="theme-card rounded-lg overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="theme-text-muted">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="theme-bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                      Submitted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:theme-bg-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium theme-text-primary">
                            {submission.users?.firstName || 'Unknown'} {submission.users?.lastName || 'User'}
                          </div>
                          <div className="text-sm theme-text-muted">
                            {submission.users?.email || 'No email'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-primary">
                        {formatDate(submission.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.fileUrl ? (
                          <span className="text-sm theme-text-primary">PDF File</span>
                        ) : (
                          <span className="text-sm theme-text-muted">No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.score !== null ? (
                          <span className="text-sm theme-text-primary">
                            {submission.score}/{submission.totalMarks}
                          </span>
                        ) : (
                          <span className="text-sm theme-text-muted">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          submission.status === 'graded' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {submission.status === 'graded' ? 'Graded' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                        {submission.fileUrl && (
                          <>
                            <button
                              onClick={() => setViewingSubmission(submission)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </button>
                            <a
                              href={`http://localhost:5000${submission.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </a>
                          </>
                        )}
                          <button
                            onClick={() => startGrading(submission)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                          >
                            {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Grading Modal */}
        {gradingSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-card p-6 rounded-lg w-full max-w-md mx-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold theme-text-primary">
                  Grade Assignment
                </h3>
                <p className="theme-text-secondary">
                  {gradingSubmission.users?.firstName || 'Unknown'} {gradingSubmission.users?.lastName || 'User'}
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Score (out of {gradingSubmission.totalMarks})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={gradingSubmission.totalMarks}
                    value={gradeForm.score}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, score: e.target.value }))}
                    className="w-full px-3 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter score"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Provide feedback to the student..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGradingSubmission(null);
                      setGradeForm({ score: '', feedback: '' });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitGradeModal}
                    className="flex-1 flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Submit Grade
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {viewingSubmission && (
          <PDFViewer
            submission={viewingSubmission}
            onClose={() => setViewingSubmission(null)}
            onGradeSubmit={submitGrade}
          />
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmissions;