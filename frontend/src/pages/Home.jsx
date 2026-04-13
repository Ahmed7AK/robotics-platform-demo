import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Calendar, ChevronRight } from 'lucide-react';
import api from '../lib/axios';

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ teams: [], achievements: [], events: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [teamsRes, achRes, eventsRes] = await Promise.all([
          api.get('/teams'),
          api.get('/achievements/me'),
          api.get('/events')
        ]);
        setData({
          teams: teamsRes.data,
          achievements: achRes.data,
          events: eventsRes.data
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.displayName}!</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Here is what is happening with your projects today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects (Left large card) */}
        <div className="lg:col-span-2 bg-[var(--color-panel)] rounded-xl border border-gray-800 p-6 flex flex-col h-[500px]">
          <h2 className="text-lg font-bold mb-4">Active Projects</h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {data.teams.length === 0 ? (
              <p className="text-[var(--color-text-muted)] text-sm italic">You don't have any active projects yet.</p>
            ) : (
              data.teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="w-full bg-[var(--color-panel-light)] rounded-lg p-5 flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors text-left group"
                >
                  <div>
                    <h3 className="font-semibold text-[var(--color-primary)]">{team.project_title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">Team: {team.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold uppercase ${team.status === 'active' ? 'text-emerald-400' : team.status === 'completed' ? 'text-blue-400' : 'text-red-400'}`}>
                      {team.status}
                    </span>
                    <ChevronRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 h-[500px]">
          {/* Achievements Card */}
          <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Achievements</h2>
              <Award className="text-[var(--color-accent)]" size={20} />
            </div>
            <div className="flex-1 overflow-y-auto">
              {data.achievements.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-sm italic">No achievements yet.</p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {data.achievements.map((ach) => (
                    <div key={ach.id} className="aspect-square bg-[var(--color-panel-light)] rounded-lg flex items-center justify-center p-2 group relative border border-gray-700 cursor-help">
                      <Award className="text-[var(--color-primary)] opacity-80 group-hover:opacity-100 transition-opacity" size={24} />
                      <div className="absolute opacity-0 group-hover:opacity-100 bg-black text-xs px-2 py-1 justify-center rounded -top-8 w-max transition-opacity z-10 pointer-events-none border border-gray-700">
                        {ach.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events Card */}
          <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Upcoming Events</h2>
              <Calendar className="text-emerald-500" size={20} />
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {data.events.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-sm italic">No upcoming events.</p>
              ) : (
                data.events.map((evt) => {
                  const date = new Date(evt.event_date);
                  return (
                    <div key={evt.id} className="flex items-start gap-4 p-3 bg-[var(--color-panel-light)] border border-gray-700 rounded-lg">
                      <div className="bg-gray-800 text-center rounded px-3 py-1 flex flex-col items-center">
                        <span className="text-xs text-[var(--color-text-muted)] uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-bold text-white">{date.getDate()}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm leading-tight text-emerald-400">{evt.title}</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">{evt.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
