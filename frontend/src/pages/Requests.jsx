import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Package, AlertTriangle, Plus, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

export const Requests = () => {
  const [activeTab, setActiveTab] = useState('browse'); // 'my_requests' | 'browse'
  const [equipmentNameFilter, setEquipmentNameFilter] = useState('');
  
  const [equipment, setEquipment] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eqRes, reqRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/equipment/requests')
      ]);
      setEquipment(eqRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openRequestModal = (eq) => {
    setSelectedEq(eq);
    setQuantity(1);
    setReason('');
    setIsModalOpen(true);
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/equipment/requests', {
        equipment_id: selectedEq.id,
        quantity: parseInt(quantity, 10),
      });
      setIsModalOpen(false);
      setActiveTab('my_requests');
      fetchData(); // refresh lists
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved': return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50"><CheckCircle size={12}/> Approved</span>;
      case 'denied': return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 ring-1 ring-red-500/50"><XCircle size={12}/> Denied</span>;
      case 'returned': return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400 ring-1 ring-gray-500/50"><Package size={12}/> Returned</span>;
      default: return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50"><Clock size={12}/> Pending</span>;
    }
  };

  if (loading) return <div className="p-8">Loading lab system...</div>;

  const filteredEquipment = equipment.filter(e => e.name.toLowerCase().includes(equipmentNameFilter.toLowerCase()));

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lab Equipment</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Manage and request hardware for your robotics projects.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('browse')}
          className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'browse' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Browse Equipment
        </button>
        <button 
          onClick={() => setActiveTab('my_requests')}
          className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'my_requests' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-200'}`}
        >
          My Requests
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'browse' && (
          <div className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search equipment..." 
                className="w-full bg-[var(--color-panel)] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                value={equipmentNameFilter}
                onChange={e => setEquipmentNameFilter(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map(eq => {
                const isAvail = eq.quantity_available > 0;
                return (
                  <div key={eq.id} className="bg-[var(--color-panel)] border border-gray-800 rounded-xl p-5 flex flex-col hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg">{eq.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ring-1 ${isAvail ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/50' : 'bg-red-500/20 text-red-400 ring-red-500/50'}`}>
                        {eq.quantity_available} / {eq.quantity_total}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 flex-1">{eq.description}</p>
                    
                    {eq.requires_admin_approval && (
                      <div className="flex items-center gap-2 text-xs text-yellow-500/80 mb-4 bg-yellow-500/10 p-2 rounded">
                        <AlertTriangle size={14} /> Requires admin approval
                      </div>
                    )}
                    
                    <button 
                      onClick={() => openRequestModal(eq)}
                      disabled={!isAvail}
                      className="w-full mt-auto py-2 rounded-lg font-medium flex items-center justify-center gap-2 bg-[var(--color-sidebar)] hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 transition-colors"
                    >
                      <Plus size={16} /> Request Item
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'my_requests' && (
          <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#18181b] text-gray-400">
                <tr>
                  <th className="p-4 font-semibold">Equipment</th>
                  <th className="p-4 font-semibold">Quantity</th>
                  <th className="p-4 font-semibold">Requested At</th>
                  <th className="p-4 font-semibold">Resolved At</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[var(--color-text-muted)] italic">No requests made yet.</td></tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id} className="border-t border-gray-800 hover:bg-[#18181b]/50">
                      <td className="p-4 font-medium text-white">{req.equipment_name}</td>
                      <td className="p-4">{req.quantity}</td>
                      <td className="p-4">{new Date(req.requested_at).toLocaleDateString()}</td>
                      <td className="p-4">{req.resolved_at ? new Date(req.resolved_at).toLocaleDateString() : '-'}</td>
                      <td className="p-4">{getStatusChip(req.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {isModalOpen && selectedEq && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[var(--color-panel)] max-w-md w-full rounded-2xl border border-gray-700 shadow-2xl p-6 relative">
            <h2 className="text-xl font-bold mb-1">Request {selectedEq.name}</h2>
            <p className="text-sm text-gray-400 mb-6">{selectedEq.description}</p>
            
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedEq.quantity_available} 
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full bg-[var(--color-sidebar)] border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:border-[var(--color-primary)]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason for request</label>
                <textarea 
                  rows="3" 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-[var(--color-sidebar)] border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="Need this for the minitalk hardware extension..."
                  required
                ></textarea>
              </div>

              {selectedEq.requires_admin_approval && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/90 text-xs p-3 rounded flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <p>This item requires admin approval. You will be notified when your request is reviewed.</p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded transition-colors">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
