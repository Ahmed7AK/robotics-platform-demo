import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Users, FolderGit2, Package, Calendar, Check, X, Shield, Plus, Edit2, Trash2 } from 'lucide-react';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'projects', 'equipment', 'events'
  
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple general fetcher
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'members') {
        const { data } = await api.get('/users');
        setUsers(data);
      } else if (activeTab === 'equipment') {
        const { data } = await api.get('/equipment/requests');
        setRequests(data);
      } else if (activeTab === 'events') {
        const { data } = await api.get('/events');
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const updateRank = async (userId, newRank) => {
    try {
      await api.patch(`/users/${userId}/rank`, { rank: newRank });
      fetchData();
    } catch(err) {
      alert('Error updating rank');
    }
  };

  const handleRequestStatus = async (reqId, status) => {
    try {
      await api.patch(`/equipment/requests/${reqId}`, { status });
      fetchData();
    } catch(err) {
      alert('Error updating request');
    }
  };

  if (loading && activeTab === 'members' && users.length === 0) return <div className="p-8">Loading admin panel...</div>;

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <Shield size={24} /> Admin Interface
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">Manage the platform data, users, and requests.</p>
        </div>
      </div>

      <div className="flex border-b border-gray-800 gap-6">
        <button 
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 pb-3 font-medium transition-colors ${activeTab === 'members' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Users size={18} /> Members
        </button>
        <button 
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 pb-3 font-medium transition-colors ${activeTab === 'projects' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <FolderGit2 size={18} /> Projects
        </button>
        <button 
          onClick={() => setActiveTab('equipment')}
          className={`flex items-center gap-2 pb-3 font-medium transition-colors ${activeTab === 'equipment' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Package size={18} /> Equipment
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 pb-3 font-medium transition-colors ${activeTab === 'events' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Calendar size={18} /> Events
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#18181b] text-gray-400">
                <tr>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Rank</th>
                  <th className="p-4 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-gray-800 hover:bg-[#18181b]/50">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xs">{u.username.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="font-semibold text-white">{u.display_name}</div>
                        <div className="text-xs text-gray-500">@{u.username}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={u.rank} 
                        onChange={(e) => updateRank(u.id, e.target.value)}
                        className="bg-[var(--color-sidebar)] text-white text-xs border border-gray-700 rounded p-1 focus:outline-none focus:border-[var(--color-primary)]"
                      >
                        {['S', 'A', 'B', 'C', 'D'].map(r => <option key={r} value={r}>Rank {r}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right">{new Date(u.member_since).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PROJECTS TAB (Mocked specific parts for brevity) */}
        {activeTab === 'projects' && (
          <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-8 text-center text-gray-400 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
             <FolderGit2 size={48} className="mb-4 opacity-50 text-[var(--color-primary)]" />
             <h2 className="text-xl font-bold text-white mb-2">Projects Management</h2>
             <p className="max-w-md mx-auto">Full administrative GUI for creating and deleting courses in the skill tree goes here.</p>
             <button className="mt-6 flex items-center gap-2 bg-[var(--color-primary)] px-4 py-2 text-white font-bold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"><Plus size={18} /> New Project</button>
          </div>
        )}

        {/* EQUIPMENT REQUESTS TAB */}
        {activeTab === 'equipment' && (
          <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#18181b] text-gray-400">
                <tr>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Item & Qty</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Requested</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} className="border-t border-gray-800 hover:bg-[#18181b]/50">
                    <td className="p-4 font-medium text-white">{req.display_name} <span className="text-gray-500 font-normal">@{req.username}</span></td>
                    <td className="p-4">{req.equipment_name} <span className="font-bold text-[var(--color-primary)]">x{req.quantity}</span></td>
                    <td className="p-4 uppercase text-xs font-bold tracking-wider">{req.status}</td>
                    <td className="p-4">{new Date(req.requested_at).toLocaleDateString()}</td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => handleRequestStatus(req.id, 'approved')} className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded" title="Approve"><Check size={16}/></button>
                          <button onClick={() => handleRequestStatus(req.id, 'denied')} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded" title="Deny"><X size={16}/></button>
                        </>
                      )}
                      {req.status === 'approved' && (
                        <button onClick={() => handleRequestStatus(req.id, 'returned')} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded font-medium">Mark Returned</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="space-y-4">
             <div className="flex justify-end">
               <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-white font-bold rounded-lg transition-colors text-sm"><Plus size={16} /> Schedule Event</button>
             </div>
             {events.map((evt) => (
                <div key={evt.id} className="bg-[var(--color-panel)] border border-gray-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-emerald-400 mb-1">{evt.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{evt.description}</p>
                    <div className="text-xs text-gray-500 font-medium">{new Date(evt.event_date).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300"><Edit2 size={16} /></button>
                     <button className="p-2 bg-gray-800 rounded hover:bg-red-500/20 text-red-400"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
