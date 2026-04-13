import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ClipboardCheck } from 'lucide-react';

export const Evaluations = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [forms, setForms] = useState({});

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/submissions/available-evaluations');
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const updateForm = (submissionId, patch) => {
    setForms((prev) => ({
      ...prev,
      [submissionId]: {
        score: 70,
        feedback: '',
        ...prev[submissionId],
        ...patch
      }
    }));
  };

  const submitEvaluation = async (submissionId) => {
    const form = forms[submissionId] || { score: 70, feedback: '' };
    if (!form.feedback?.trim()) {
      alert('Please provide feedback before submitting evaluation.');
      return;
    }

    setSavingId(submissionId);
    try {
      await api.post('/submissions/evaluations', {
        submission_id: submissionId,
        score: Number(form.score),
        feedback: form.feedback.trim()
      });

      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setForms((prev) => {
        const next = { ...prev };
        delete next[submissionId];
        return next;
      });
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="p-8">Loading evaluation queue...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Project Evaluations</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Evaluate other teams' submitted projects.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-8 text-center text-[var(--color-text-muted)] italic">
          No submissions are currently available for you to evaluate.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const form = forms[submission.id] || { score: 70, feedback: '' };
            const isSaving = savingId === submission.id;

            return (
              <div key={submission.id} className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-primary)]">{submission.project_title}</h2>
                    <p className="text-sm text-gray-300">Team: {submission.team_name}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-[var(--color-sidebar)] border border-gray-800 rounded-lg p-3 text-sm text-gray-300 mb-4">
                  {submission.notes || 'No submission notes provided.'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="text-sm text-gray-300">
                    Score
                    <input
                      type="number"
                      min="0"
                      max="125"
                      value={form.score}
                      onChange={(e) => updateForm(submission.id, { score: e.target.value })}
                      className="mt-1 w-full bg-[var(--color-sidebar)] border border-gray-700 rounded-md p-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </label>
                </div>

                <textarea
                  rows={4}
                  value={form.feedback}
                  onChange={(e) => updateForm(submission.id, { feedback: e.target.value })}
                  placeholder="Write technical feedback with strengths, issues, and improvement points."
                  className="mt-3 w-full bg-[var(--color-sidebar)] border border-gray-700 rounded-md p-3 text-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />

                <button
                  onClick={() => submitEvaluation(submission.id)}
                  disabled={isSaving}
                  className="mt-3 px-4 py-2 text-sm font-bold bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded transition-colors inline-flex items-center gap-2"
                >
                  <ClipboardCheck size={16} />
                  Submit Evaluation
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
