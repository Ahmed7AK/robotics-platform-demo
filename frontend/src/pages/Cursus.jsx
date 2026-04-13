import { useState, useEffect, useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const CustomNode = ({ data }) => {
  const rank = data.project?.rank_required || 'D';
  // Define explicit rank colors
  const colors = {
    S: '#ef4444', // Red
    A: '#f97316', // Orange
    B: '#eab308', // Yellow
    C: '#22c55e', // Green
    D: '#3b82f6', // Blue
    E: '#a855f7'  // Purple
  };
  const color = colors[rank] || colors['D'];
  
  let style = {
     width: '64px', height: '64px', borderRadius: '50%',
     display: 'flex', alignItems: 'center', justifyContent: 'center',
     fontWeight: 'bold', border: '2px solid', transition: 'all 0.3s',
     cursor: 'pointer', textAlign: 'center', fontSize: '0.75rem', lineHeight: '1.25'
  };

  if (data.nodeState === 'completed') {
    style.backgroundColor = color;
    style.borderColor = color;
    style.color = '#ffffff';
    style.boxShadow = `0 0 15px ${color}`;
  } else if (data.nodeState === 'available') {
    style.backgroundColor = 'var(--color-dark)';
    style.borderColor = color;
    style.color = color;
  } else if (data.nodeState === 'in_progress') {
    style.backgroundColor = color;
    style.borderColor = '#ffffff';
    style.color = '#ffffff';
    style.boxShadow = `0 0 20px ${color}`;
    style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
  } else {
    // locked
    style.backgroundColor = '#1f2937'; // gray-800
    style.borderColor = '#4b5563'; // gray-600
    style.color = '#6b7280'; // gray-500
  }

  return (
    <div style={style}>
      <span style={{ padding: '0 4px' }}>{data.label}</span>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export const Cursus = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        setProjects(data);
        generateSkillTree(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch users for team building
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users/list');
        setAllUsers(data); // exclude self
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [user.id]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const generateSkillTree = (projData) => {
	const rankGroups = {
	E: { radius: 150, items: [] },
	D: { radius: 300, items: [] },
	C: { radius: 450, items: [] },
	B: { radius: 600, items: [] },
	A: { radius: 750, items: [] },
	S: { radius: 900, items: [] }
	};
    
    projData.forEach(p => rankGroups[p.rank_required]?.items.push(p));

    const newNodes = [];
    const newEdges = [];

    let prevTierIds = [];

    // Construct circles
    ['E', 'D', 'C', 'B', 'A', 'S'].forEach((tier) => {
      const g = rankGroups[tier];
      const count = g.items.length;
      let currentTierIds = [];

      g.items.forEach((p, i) => {
        let x = 0, y = 0;
        if (g.radius > 0) {
          const angle = (i / count) * 2 * Math.PI - Math.PI / 2; // start from top
          x = g.radius * Math.cos(angle);
          y = g.radius * Math.sin(angle);
        }

        // Determine state (simplified logic based on rank requirement vs user rank)
        let state = p.status;
        if (state === 'locked' && Object.keys(rankGroups).indexOf(user.rank) >= Object.keys(rankGroups).indexOf(tier)) {
          state = 'available';
        }

        newNodes.push({
          id: String(p.id),
          type: 'custom',
          position: { x: x + window.innerWidth/2 - 100, y: y + window.innerHeight/2 - 100 },
          data: { label: p.title, nodeState: state, project: p },
        });
        currentTierIds.push(String(p.id));

        // Connect to previous tier
        if (prevTierIds.length > 0) {
          const sourceId = prevTierIds[i % prevTierIds.length];
          newEdges.push({
            id: `e${sourceId}-${p.id}`,
            source: sourceId,
            target: String(p.id),
            animated: state === 'available' || state === 'in_progress',
            style: { stroke: state === 'locked' ? '#374151' : '#F97316', strokeWidth: 2 }
          });
        }
      });
      prevTierIds = currentTierIds.length > 0 ? currentTierIds : prevTierIds;
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onNodeClick = (_, node) => {
    if (node.data.nodeState !== 'locked') {
      setSelectedNode(node.data.project);
      setTeamName(`Team ${user.username}-${node.data.project.title}`);
      setSelectedMembers([]);
    }
  };

  const toggleMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }
    try {
      await api.post('/teams', { 
        project_id: selectedNode.id, 
        name: teamName.trim(),
        member_ids: selectedMembers
      });
      alert('Team created successfully!');
      setSelectedNode(null);
    } catch(err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="flex flex-col -m-8 relative" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="absolute top-4 left-8 z-10">
        <h1 className="text-2xl font-bold bg-[var(--color-dark)] px-4 py-2 rounded-lg border border-gray-800 shadow-xl">
          Skill Tree Cursus
        </h1>
      </div>
      
      <div className="flex-1 bg-[--color-dark]">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          className="bg-[var(--color-dark)]"
        >
          <Background color="#1f2937" gap={30} size={2} />
          <Controls className="bg-[var(--color-sidebar)] border-gray-800 fill-[var(--color-primary)]" />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-sidebar)] max-w-lg w-full rounded-2xl border border-gray-700 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">{selectedNode.title}</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded bg-[var(--color-accent)] bg-opacity-20 text-[white] text-xs font-bold ring-1 ring-[var(--color-accent)]">
                Rank {selectedNode.rank_required} Required
              </span>
              <span className="text-xs text-gray-400">Status: {selectedNode.status.toUpperCase()}</span>
            </div>
            <p className="text-gray-300 mb-6">{selectedNode.description}</p>
            
            {/* Team Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Team Name</label>
              <input 
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-[var(--color-panel)] border border-gray-700 rounded-md p-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                placeholder="Enter your team name..."
              />
            </div>

            {/* Member Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Invite Members <span className="text-gray-500 font-normal">({selectedMembers.length} selected)</span>
              </label>
              <div className="bg-[var(--color-panel)] border border-gray-700 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                {allUsers.length === 0 ? (
                  <p className="text-xs text-gray-500 p-2 text-center italic">No other users found.</p>
                ) : (
                  allUsers.map(u => {
                    const isSelected = selectedMembers.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        onClick={() => toggleMember(u.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-md text-left text-sm transition-colors ${
                          isSelected 
                            ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 text-white' 
                            : 'hover:bg-gray-800 text-gray-300 border border-transparent'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate block">{u.display_name}</span>
                          <span className="text-xs text-gray-500">@{u.username}</span>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-gray-600'
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <button onClick={handleCreateTeam} className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 rounded-lg transition-colors">
              Create Team & Start Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

