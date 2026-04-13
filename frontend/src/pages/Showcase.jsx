import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Filter, X, Star } from 'lucide-react';

export const Showcase = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRank, setFilterRank] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'score'
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const { data } = await api.get('/teams/showcase');
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowcase();
  }, []);

  const sortedAndFiltered = projects
    .filter((p) => (filterRank === 'All' ? true : p.rank_required === filterRank))
    .sort((a, b) => {
      if (sortBy === 'score') return Number(b.avg_score) - Number(a.avg_score);
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    });

  if (loading) return <div className="p-8">Loading showcase...</div>;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Showcase</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Explore completed projects from the 42 Robotics club.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--color-sidebar)] p-2 rounded-lg border border-gray-800">
          <div className="flex items-center gap-2 px-3 border-r border-gray-700">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={filterRank} 
              onChange={e => setFilterRank(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Ranks</option>
              <option value="S">Rank S</option>
              <option value="A">Rank A</option>
              <option value="B">Rank B</option>
              <option value="C">Rank C</option>
              <option value="D">Rank D</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 px-3">
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sortedAndFiltered.map((p) => (
          <div 
            key={p.id} 
            onClick={() => setSelectedItem(p)}
            className="group bg-[var(--color-panel)] rounded-xl border border-gray-800 overflow-hidden cursor-pointer hover:border-[var(--color-primary)] transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-primary)]/10"
          >
            <div className="aspect-video bg-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                <span className="text-4xl opacity-20 font-black tracking-tighter">42</span>
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <span className="px-2 py-1 rounded bg-black/60 backdrop-blur text-xs font-bold ring-1 ring-white/10 flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" /> {Number(p.avg_score).toFixed(1)}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-[var(--color-primary)] truncate text-lg group-hover:text-[var(--color-primary-hover)] transition-colors">{p.project_title}</h3>
              <p className="text-sm text-gray-300 truncate mt-1">Team: {p.name}</p>
              <div className="text-xs text-[var(--color-text-muted)] mt-4">
                Submitted {new Date(p.submitted_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--color-sidebar)] max-w-2xl w-full rounded-2xl border border-gray-700 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-gray-400 hover:text-white z-10 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="h-48 bg-gradient-to-br from-gray-800 to-black relative flex items-end p-8 border-b border-gray-800">
              <h2 className="text-3xl font-bold text-white z-10">{selectedItem.project_title} <span className="text-[var(--color-primary)] text-xl opacity-80 block md:inline md:ml-2">({selectedItem.name})</span></h2>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex items-center gap-6 border-b border-gray-800 pb-6 mb-6">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">Final Score</p>
                  <p className="text-4xl font-black text-[var(--color-accent)]">{Number(selectedItem.avg_score).toFixed(1)}</p>
                </div>
                <div className="w-px h-12 bg-gray-800"></div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">Submission Date</p>
                  <p className="text-lg font-medium">{new Date(selectedItem.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2 text-[var(--color-primary)]">
                     Student Notes
                  </h3>
                  <div className="bg-[var(--color-panel)] rounded-lg p-4 border border-gray-800 text-sm text-gray-300">
                    {selectedItem.notes}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2 text-[var(--color-accent)]">
                     Evaluation Summary
                  </h3>
                  <div className="bg-[#7c3aed]/10 rounded-lg p-4 border border-[#7c3aed]/20 text-sm text-gray-300 italic">
                    {selectedItem.evaluation_count} evaluation(s) completed for this submission.
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};
