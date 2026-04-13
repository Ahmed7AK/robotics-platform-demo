import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Crown, Users, FolderGit2, Clock, CheckCircle } from 'lucide-react';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitNotes, setSubmitNotes] = useState('');
  const [evalScore, setEvalScore] = useState(70);
  const [evalFeedback, setEvalFeedback] = useState('');

  const fetchTeam = async () => {
    try {
      const { data } = await api.get(`/teams/${id}`);
      setTeam(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const isLeader = team && user && team.leader_id === user.id;
  const hasSubmission = !!team?.latest_submission;

  const handleCompleteProject = async () => {
    setSaving(true);
    try {
      await api.patch(`/teams/${id}/complete`);
      await fetchTeam();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitProject = async () => {
    if (!submitNotes.trim()) {
      alert('Add submission notes before submitting.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/submissions', {
        team_id: team.id,
        project_id: team.project_id,
        notes: submitNotes.trim()
      });
      setSubmitNotes('');
      await fetchTeam();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEvaluateSubmission = async () => {
    if (!evalFeedback.trim()) {
      alert('Please provide feedback.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/submissions/evaluations', {
        submission_id: team.latest_submission.id,
        score: Number(evalScore),
        feedback: evalFeedback.trim()
      });
      setEvalFeedback('');
      setEvalScore(70);
      await fetchTeam();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading project details...</div>;
  if (!team) return <div className="p-8 text-red-400">Team not found.</div>;

  const statusColors = {
    active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/50' },
    completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', ring: 'ring-blue-500/50' },
    disbanded: { bg: 'bg-red-500/20', text: 'text-red-400', ring: 'ring-red-500/50' },
  };
  const sc = statusColors[team.status] || statusColors.active;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Header Card */}
      <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 flex items-center justify-center">
              <FolderGit2 size={28} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{team.project_title}</h1>
              <p className="text-sm text-gray-400 mt-1">Team: <span className="text-white font-medium">{team.name}</span></p>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ring-1 ${sc.bg} ${sc.text} ${sc.ring}`}>
            {team.status?.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-300 leading-relaxed mb-6">{team.project_description}</p>

        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>{team.members?.length || 0} Members</span>
          </div>
          {team.rank_required && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[var(--color-accent)]/20 text-white text-xs font-bold ring-1 ring-[var(--color-accent)]/50">
                Rank {team.rank_required}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users size={20} className="text-[var(--color-primary)]" /> Team Members
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {team.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 bg-[var(--color-sidebar)] rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  member.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate">{member.display_name}</span>
                  {member.id === team.leader_id && (
                    <Crown size={14} className="text-yellow-500 shrink-0" title="Team Leader" />
                  )}
                </div>
                <span className="text-xs text-gray-500">@{member.username}</span>
              </div>
              <span className="px-2 py-0.5 text-xs rounded bg-gray-800 text-gray-300 border border-gray-700">
                Rank {member.rank}
              </span>
            </div>
          ))}
        </div>
      </div>

      {(isLeader || hasSubmission || team?.can_evaluate) && (
        <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-6 space-y-5">
          {isLeader && team.status !== 'completed' && (
            <div>
              <h2 className="text-lg font-bold mb-2">Team Leader Actions</h2>
              <p className="text-sm text-gray-400 mb-3">When your team finishes the work, mark it complete to unlock submission.</p>
              <button
                onClick={handleCompleteProject}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded transition-colors"
              >
                Complete Project
              </button>
            </div>
          )}

          {isLeader && team.status === 'completed' && !hasSubmission && (
            <div>
              <h2 className="text-lg font-bold mb-2">Submit for Evaluation</h2>
              <textarea
                rows={4}
                value={submitNotes}
                onChange={(e) => setSubmitNotes(e.target.value)}
                placeholder="Summarize implementation details, known limits, and testing evidence."
                className="w-full bg-[var(--color-sidebar)] border border-gray-700 rounded-md p-3 text-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                onClick={handleSubmitProject}
                disabled={saving}
                className="mt-3 px-4 py-2 text-sm font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white rounded transition-colors"
              >
                Submit Project
              </button>
            </div>
          )}

          {hasSubmission && (
            <div className="text-sm text-gray-300 bg-[var(--color-sidebar)] border border-gray-800 rounded-lg p-4">
              <div className="font-semibold text-white mb-1">Submission Status: {team.latest_submission.status}</div>
              <div>Evaluations: {team.latest_submission.evaluation_count}</div>
              <div>Average Score: {Number(team.latest_submission.avg_score).toFixed(2)}</div>
            </div>
          )}

          {team?.can_evaluate && hasSubmission && (
            <div>
              <h2 className="text-lg font-bold mb-2">Evaluate Submission</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="text-sm text-gray-300">
                  Score
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={evalScore}
                    onChange={(e) => setEvalScore(e.target.value)}
                    className="mt-1 w-full bg-[var(--color-sidebar)] border border-gray-700 rounded-md p-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </label>
              </div>
              <textarea
                rows={4}
                value={evalFeedback}
                onChange={(e) => setEvalFeedback(e.target.value)}
                placeholder="Write actionable technical feedback."
                className="mt-3 w-full bg-[var(--color-sidebar)] border border-gray-700 rounded-md p-3 text-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                onClick={handleEvaluateSubmission}
                disabled={saving}
                className="mt-3 px-4 py-2 text-sm font-bold bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded transition-colors"
              >
                Submit Evaluation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Project Objectives (placeholder section for future use) */}
      <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-emerald-400" /> Objectives
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[var(--color-sidebar)] rounded-lg border border-gray-800">
            <CheckCircle size={16} className="text-gray-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-400">Project objectives and milestones will be displayed here once configured by an admin.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
