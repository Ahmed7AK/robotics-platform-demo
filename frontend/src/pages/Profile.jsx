import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import api from '../lib/axios';
import { Award, ChevronRight } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [achRes, teamsRes] = await Promise.all([
          api.get('/achievements/me'),
          api.get('/teams')
        ]);
        
        // Radar data (kept as mock — would be derived from backend stats in production)
        const radarData = [
          { subject: 'Software', A: 120, fullMark: 150 },
          { subject: 'Hardware', A: 98, fullMark: 150 },
          { subject: 'Teamwork', A: 86, fullMark: 150 },
          { subject: 'Evaluation', A: 99, fullMark: 150 },
          { subject: 'Innovation', A: 85, fullMark: 150 },
        ];

        setData({
          achievements: achRes.data,
          radarData,
          teams: teamsRes.data
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) return <div>Loading Profile...</div>;

  const joinDate = user.member_since ? new Date(user.member_since).toLocaleDateString() : 'N/A';

  const statusColors = {
    active: 'text-emerald-400',
    completed: 'text-blue-400',
    disbanded: 'text-red-400',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Header */}
      <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[var(--color-sidebar)] border-2 border-[var(--color-primary)] flex items-center justify-center overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold">{user.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.displayName || user.username}</h1>
            <p className="text-[var(--color-text-muted)] text-lg">@{user.username}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 rounded-full bg-[var(--color-accent)] bg-opacity-20 text-[var(--color-accent)] text-sm font-bold ring-1 ring-[var(--color-accent)]">
                Rank {user.rank}
              </span>
              <span className="text-sm text-gray-400">Member since {joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-1 bg-[var(--color-panel)] rounded-xl border border-gray-800 p-6 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold mb-2 text-center text-gray-300">Skill Pentagon</h2>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name={user.username} dataKey="A" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Projects — Dynamic from API */}
        <div className="lg:col-span-2 bg-[var(--color-panel)] rounded-xl border border-gray-800 p-6 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold mb-4">Active Projects</h2>
          <div className="flex-1 overflow-auto pr-2">
            {data.teams.length === 0 ? (
              <p className="text-[var(--color-text-muted)] text-sm italic">No active projects yet. Head to the Cursus to join one!</p>
            ) : (
              <div className="space-y-3">
                {data.teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => navigate(`/teams/${team.id}`)}
                    className="w-full flex items-center justify-between p-4 bg-[var(--color-sidebar)] border border-gray-800 rounded-lg hover:border-gray-600 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--color-primary)] truncate">{team.project_title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">Team: {team.name}</span>
                        <span className={`text-xs font-bold uppercase ${statusColors[team.status] || 'text-gray-400'}`}>
                          {team.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-600 group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Achievements Gallery */}
        <div className="lg:col-span-3 bg-[var(--color-panel)] rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold mb-4">Achievements Gallery</h2>
          {data.achievements.length === 0 ? (
            <p className="text-[var(--color-text-muted)] italic">No achievements unlocked yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="bg-[var(--color-sidebar)] rounded-xl p-4 flex flex-col items-center justify-center border border-gray-800 text-center hover:border-[var(--color-primary)] transition-colors cursor-default group">
                  <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center mb-3">
                    <Award className="text-[var(--color-primary)] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{ach.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{ach.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
