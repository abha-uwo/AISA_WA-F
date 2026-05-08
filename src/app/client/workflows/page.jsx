'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  GitBranch, Plus, Loader2, X, MessageSquare, ArrowRight, Zap, 
  PlayCircle, Image as ImageIcon, Video, ClipboardList, MousePointer2, 
  ChevronRight, MoreVertical, LayoutGrid, Search, Minus, Target, Activity, Clock
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Helper: compute port position based on node data
// Card layout: p-10(40) + header(48+32pb+32mb=112) + textarea(h-24=96) + space-y-6(24) + mt-6(24) + buttons-header(28) + buttons
const getPortPosition = (node, portType, portIndex) => {
  const cardPadding = 40;
  const headerHeight = 112;
  const textareaHeight = 96;
  const gapAfterTextarea = 24;
  const buttonSectionMargin = 24;
  const buttonHeaderHeight = 28;
  const buttonHeight = 48;
  const buttonGap = 12;
  const cardWidth = 560;

  if (portType === 'input') {
    return { x: node.x + cardWidth / 2, y: node.y - 16 };
  }
  if (portType === 'output') {
    const hasButtons = node.buttons && node.buttons.length > 0;
    let cardH = cardPadding + headerHeight + textareaHeight + cardPadding;
    if (hasButtons) {
      cardH = cardPadding + headerHeight + textareaHeight + gapAfterTextarea + buttonSectionMargin + buttonHeaderHeight + (node.buttons.length * buttonHeight) + ((node.buttons.length - 1) * buttonGap) + cardPadding;
    }
    return { x: node.x + cardWidth / 2, y: node.y + cardH + 16 };
  }
  if (portType === 'button') {
    const baseY = cardPadding + headerHeight + textareaHeight + gapAfterTextarea + buttonSectionMargin + buttonHeaderHeight;
    const btnCenterY = baseY + (portIndex * (buttonHeight + buttonGap)) + buttonHeight / 2;
    return { x: node.x + cardWidth + 12, y: node.y + btnCenterY };
  }
  return { x: node.x, y: node.y };
};

// Memoized Node Component to prevent unnecessary re-renders during dragging
const WorkflowNode = React.memo(({ node, zoom, connectingFrom, setConnectingFrom, setSelectedWorkflow, setIsDragging, connections }) => {
  // Check which button ports are connected
  const connectedPorts = React.useMemo(() => {
    const set = new Set();
    (connections || []).forEach(c => {
      if (c.from === node.id && c.fromPort !== undefined) set.add(c.fromPort);
    });
    return set;
  }, [connections, node.id]);

  const imgInputRef = useRef(null);
  const vidInputRef = useRef(null);

  return (
    <motion.div 
      drag={!connectingFrom}
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ 
        zIndex: 100,
        boxShadow: "0 40px 80px rgba(0,0,0,0.15)"
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onDrag={(e, info) => {
        setSelectedWorkflow(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => n.id === node.id ? { 
            ...n, 
            x: n.x + info.delta.x / zoom, 
            y: n.y + info.delta.y / zoom 
          } : n)
        }));
      }}
      initial={false}
      animate={{ x: node.x, y: node.y }}
      transition={{ type: 'spring', damping: 25, stiffness: 500, mass: 0.5 }}
      style={{ position: 'absolute', width: 560 }}
      className="group z-10"
    >
      {/* INPUT PORT (TOP) */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          const fromId = connectingFrom?.id || connectingFrom;
          if (fromId && fromId !== node.id) {
            setSelectedWorkflow(prev => ({
              ...prev,
              connections: [...(prev.connections || []), { 
                from: fromId, 
                to: node.id,
                fromPort: connectingFrom?.port 
              }]
            }));
            setConnectingFrom(null);
          }
        }}
        className={cn(
          "absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white shadow-xl z-50 cursor-pointer transition-all flex items-center justify-center",
          connectingFrom ? "bg-blue-500 scale-125 animate-pulse" : "bg-slate-100 hover:bg-blue-400"
        )}
      >
          <div className="w-2 h-2 rounded-full bg-white opacity-50" />
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-[0_30px_60px_rgba(0,0,0,0.06)] p-10 hover:border-blue-400 hover:shadow-[0_30px_60px_rgba(59,130,246,0.12)] transition-all relative cursor-grab active:cursor-grabbing overflow-hidden">
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-50">
          <div className="flex items-center gap-5">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", 
              node.type === 'TRIGGER' ? "bg-emerald-500" : 
              node.type === 'CONDITION' ? "bg-indigo-500" : "bg-blue-600")}>
              {node.type === 'TRIGGER' ? <Zap size={20} /> : <MessageSquare size={20} />}
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{node.type}</span>
              <input 
                type="text"
                value={node.label}
                onPointerDown={e => e.stopPropagation()}
                onChange={(e) => {
                  setSelectedWorkflow(prev => ({
                    ...prev,
                    nodes: prev.nodes.map(n => n.id === node.id ? { ...n, label: e.target.value } : n)
                  }));
                }}
                className="text-lg font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full cursor-text"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={(e) => { e.stopPropagation(); setSelectedWorkflow(prev => ({ ...prev, nodes: prev.nodes.filter(n => n.id !== node.id) })); }} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X size={18} /></button>
          </div>
        </div>

        <div className="space-y-6 pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
          <textarea 
            value={node.content}
            placeholder="Type your message here..."
            onPointerDown={e => e.stopPropagation()}
            onChange={(e) => {
              setSelectedWorkflow(prev => ({
                ...prev,
                nodes: prev.nodes.map(n => n.id === node.id ? { ...n, content: e.target.value } : n)
              }));
            }}
            className="w-full text-sm text-slate-600 leading-relaxed italic bg-slate-50/50 rounded-2xl p-4 border border-transparent focus:border-blue-200 focus:bg-white transition-all resize-none h-24 cursor-text"
          />

          {/* IMAGE UPLOAD for IMAGE type */}
          {node.type === 'IMAGE' && (
            <div className="mt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Image</p>
              <input 
                ref={imgInputRef}
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setSelectedWorkflow(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, mediaUrl: ev.target.result } : n) }));
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
              />
              {node.mediaUrl ? (
                <div className="relative group/media">
                  <img src={node.mediaUrl} alt="Uploaded" className="w-full h-40 object-cover rounded-2xl border border-slate-100" />
                  <button 
                    onClick={() => setSelectedWorkflow(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, mediaUrl: '' } : n) }))}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-rose-500 opacity-0 group-hover/media:opacity-100 transition-all shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onPointerDown={e => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); imgInputRef.current?.click(); }}
                  className="flex flex-col items-center justify-center h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer"
                >
                  <ImageIcon size={24} className="text-slate-300 mb-2" />
                  <span className="text-[11px] font-bold text-slate-400">Click to upload image</span>
                  <span className="text-[9px] text-slate-300 mt-1">or paste a URL below</span>
                </div>
              )}
              <input 
                type="text"
                value={node.mediaUrl || ''}
                placeholder="Or paste image URL here..."
                onPointerDown={e => e.stopPropagation()}
                onChange={(e) => setSelectedWorkflow(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, mediaUrl: e.target.value } : n) }))}
                className="mt-2 w-full text-xs text-slate-500 bg-slate-50/50 rounded-xl p-3 border border-transparent focus:border-blue-200 focus:bg-white transition-all outline-none cursor-text"
              />
            </div>
          )}

          {/* VIDEO UPLOAD for VIDEO type */}
          {node.type === 'VIDEO' && (
            <div className="mt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Video</p>
              <input 
                ref={vidInputRef}
                type="file" 
                accept="video/*" 
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setSelectedWorkflow(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, mediaUrl: ev.target.result } : n) }));
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
              />
              {node.mediaUrl ? (
                <div className="relative group/media">
                  <video src={node.mediaUrl} controls className="w-full h-40 object-cover rounded-2xl border border-slate-100" />
                  <button 
                    onClick={() => setSelectedWorkflow(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, mediaUrl: '' } : n) }))}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-rose-500 opacity-0 group-hover/media:opacity-100 transition-all shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onPointerDown={e => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); vidInputRef.current?.click(); }}
                  className="flex flex-col items-center justify-center h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer"
                >
                  <Video size={24} className="text-slate-300 mb-2" />
                  <span className="text-[11px] font-bold text-slate-400">Click to upload video</span>
                  <span className="text-[9px] text-slate-300 mt-1">or paste a URL below</span>
                </div>
              )}
              <input 
                type="text"
                value={node.mediaUrl || ''}
                placeholder="Or paste video URL here..."
                onPointerDown={e => e.stopPropagation()}
                onChange={(e) => setSelectedWorkflow(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, mediaUrl: e.target.value } : n) }))}
                className="mt-2 w-full text-xs text-slate-500 bg-slate-50/50 rounded-xl p-3 border border-transparent focus:border-blue-200 focus:bg-white transition-all outline-none cursor-text"
              />
            </div>
          )}
          
          
          {node.buttons && (
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buttons</p>
                <button 
                  onClick={() => {
                    setSelectedWorkflow(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n => n.id === node.id ? { ...n, buttons: [...(n.buttons || []), `Button ${(n.buttons?.length || 0) + 1}`] } : n)
                    }));
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={10} /> Add Button
                </button>
              </div>
              {node.buttons.map((b, bi) => (
                <div key={bi} className="relative group/btn">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      value={b}
                      onPointerDown={e => e.stopPropagation()}
                      onChange={(e) => {
                        const newButtons = [...node.buttons];
                        newButtons[bi] = e.target.value;
                        setSelectedWorkflow(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === node.id ? { ...n, buttons: newButtons } : n)
                        }));
                      }}
                      className="flex-1 px-6 py-4 bg-blue-50/50 text-blue-600 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-blue-100/50 hover:bg-white focus:bg-white transition-all outline-none cursor-text"
                    />
                    <button 
                      onClick={() => {
                        setSelectedWorkflow(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === node.id ? { ...n, buttons: n.buttons.filter((_, i) => i !== bi) } : n)
                        }));
                      }}
                      className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-rose-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {/* BUTTON SPECIFIC PORT */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); setConnectingFrom({ id: node.id, port: bi }); }}
                    className={cn(
                      "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg z-50 cursor-pointer transition-all flex items-center justify-center",
                      connectingFrom?.id === node.id && connectingFrom?.port === bi 
                        ? "bg-blue-600 scale-125" 
                        : connectedPorts.has(bi)
                          ? "bg-blue-500 animate-pulse shadow-blue-300"
                          : "bg-slate-100 hover:bg-blue-500"
                    )}
                  >
                    <Plus size={12} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OUTPUT PORT (BOTTOM) */}
      <div 
        onClick={(e) => { e.stopPropagation(); setConnectingFrom(node.id); }}
        className={cn(
          "absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white shadow-xl z-50 cursor-pointer transition-all flex items-center justify-center",
          connectingFrom === node.id ? "bg-blue-600 scale-150 shadow-blue-200" : "bg-slate-100 hover:bg-blue-500"
        )}
      >
        <Plus size={16} className="text-white" />
      </div>
    </motion.div>
  );
}, (prev, next) => {
  return prev.node.x === next.node.x && 
         prev.node.y === next.node.y && 
         prev.node.label === next.node.label &&
         prev.node.content === next.node.content &&
         prev.node.buttons === next.node.buttons &&
         prev.node.mediaUrl === next.node.mediaUrl &&
         prev.connectingFrom === next.connectingFrom &&
         prev.connections === next.connections &&
         prev.zoom === next.zoom;
});

const ClientWorkflowsPage = () => {
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [activeTab, setActiveTab] = useState('DESIGN');
  const [zoom, setZoom] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null); // ID of node
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [workflows, setWorkflows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8080/api/workflows/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mappedWorkflows = res.data.map(wf => ({
        ...wf,
        nodes: wf.steps?.nodes || [],
        connections: wf.steps?.connections || []
      }));
      setWorkflows(mappedWorkflows);
    } catch (err) {
      console.error('Failed to fetch workflows');
    }
  };

  const handleSave = async () => {
    if (!selectedWorkflow) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: selectedWorkflow.name,
        steps: { 
          nodes: selectedWorkflow.nodes, 
          connections: selectedWorkflow.connections || [] 
        },
        status: selectedWorkflow.status || 'Draft'
      };

      if (selectedWorkflow.id && typeof selectedWorkflow.id === 'number' && selectedWorkflow.id < 1000000000) {
        await axios.patch(`http://127.0.0.1:8080/api/workflows/${selectedWorkflow.id}/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://127.0.0.1:8080/api/workflows/', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setIsGraphOpen(false);
      fetchWorkflows();
    } catch (err) {
      console.error('Failed to save workflow');
      alert('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleZoom = (type) => {
    if (type === 'IN') setZoom(prev => Math.min(prev + 0.1, 2));
    if (type === 'OUT') setZoom(prev => Math.max(prev - 0.1, 0.1));
    if (type === 'RESET') setZoom(1);
  };

  const nodeTypes = [
    { type: 'MESSAGE', label: 'Text Message', icon: MessageSquare, color: 'bg-blue-500' },
    { type: 'IMAGE', label: 'Send Image', icon: ImageIcon, color: 'bg-emerald-500' },
    { type: 'VIDEO', label: 'Send Video', icon: Video, color: 'bg-purple-500' },
    { type: 'BUTTONS', label: 'Interactive Buttons', icon: MousePointer2, color: 'bg-amber-500' },
    { type: 'FORM', label: 'Data Collection Form', icon: ClipboardList, color: 'bg-rose-500' },
    { type: 'CONDITION', label: 'Smart Condition', icon: Zap, color: 'bg-indigo-500' },
  ];

  const handleRowClick = (wf) => {
    setSelectedWorkflow(wf);
    setIsGraphOpen(true);
  };

  return (
    <>
      <DashboardLayout role="CLIENT">
        <div className="max-w-full mx-auto pb-20 px-8">
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Workflows</h1>
              <p className="text-slate-500 font-medium italic">Create rich, multi-media automated conversations.</p>
            </div>
            <button 
              onClick={() => {
                setSelectedWorkflow({
                  id: Date.now(),
                  name: 'Untitled Workflow',
                  steps: 1,
                  status: 'Draft',
                  nodes: [
                    { id: '1', type: 'TRIGGER', label: 'New Workflow Trigger', content: 'Configure how this flow starts...', x: 100, y: 100 }
                  ],
                  connections: []
                });
                setIsGraphOpen(true);
              }}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-purple-600 transition-all shadow-xl shadow-slate-100 flex items-center gap-2"
            >
              <Plus size={16} />
              Build New Flow
            </button>
          </div>

          {/* Workflow Table */}
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-24">S.No</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Flow Name</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Components</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {workflows.map((wf, i) => (
                  <tr key={wf.id} onClick={() => handleRowClick(wf)} className="hover:bg-purple-50/30 cursor-pointer transition-colors group">
                    <td className="px-8 py-6 text-sm font-bold text-slate-400 italic">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <GitBranch size={18} />
                        </div>
                        <span className="text-sm font-bold text-slate-900 tracking-tight">{wf.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 uppercase tracking-widest">{wf.nodes?.length || 0} Blocks</span>
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600"><MessageSquare size={10} /></div>
                          <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-600"><ImageIcon size={10} /></div>
                          <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-amber-600"><MousePointer2 size={10} /></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", wf.status === 'Active' ? "text-emerald-500" : "text-slate-300")}>{wf.status}</span>
                        <div className={cn("w-2 h-2 rounded-full", wf.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-slate-200")} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      {/* Pro Workflow Builder (Intercom Style) - MOVED OUTSIDE FOR TOTAL VISIBILITY */}
      <AnimatePresence>
        {isGraphOpen && selectedWorkflow && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsGraphOpen(false)} 
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#F3F4F6] w-full h-full max-w-[1600px] rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/30"
            >
              {/* Builder Header */}
              <header className="h-24 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-12 shrink-0 z-[10000]">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-4 pr-10 border-r border-slate-100">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                      <GitBranch size={22} />
                    </div>
                    <div>
                      <input 
                        type="text"
                        value={selectedWorkflow.name}
                        onChange={(e) => setSelectedWorkflow(prev => ({ ...prev, name: e.target.value }))}
                        className="text-lg font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-64 hover:bg-slate-50 rounded px-1 transition-colors"
                        placeholder="Workflow Name"
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Flow Builder</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
                    <button onClick={() => setActiveTab('DESIGN')} className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", activeTab === 'DESIGN' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Designer</button>
                    <button onClick={() => setActiveTab('STATS')} className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", activeTab === 'STATS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Analytics</button>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <PlayCircle size={18} />
                    Simulator
                  </button>

                  {/* ON/OFF Toggle */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", selectedWorkflow.status === 'Active' ? "text-emerald-600" : "text-slate-400")}>
                      {selectedWorkflow.status === 'Active' ? 'Active' : 'Draft'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedWorkflow(prev => ({
                          ...prev,
                          status: prev.status === 'Active' ? 'Draft' : 'Active'
                        }));
                      }}
                      className={cn(
                        "relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out",
                        selectedWorkflow.status === 'Active' 
                          ? "bg-emerald-500 shadow-lg shadow-emerald-200" 
                          : "bg-slate-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out",
                        selectedWorkflow.status === 'Active' ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>

                  {/* Save Button */}
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100/50 flex items-center gap-2"
                  >
                    {isSaving && <Loader2 className="animate-spin" size={14} />}
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setIsGraphOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
                </div>
              </header>

              <div className="flex-1 flex overflow-hidden relative">
                {/* Builder Sidebar */}
                <aside className="w-88 bg-white border-r border-slate-200 p-8 overflow-y-auto shrink-0 z-[999] shadow-2xl shadow-slate-200/50">
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em]">Blocks Library</p>
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded border border-slate-100">BETA</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {nodeTypes.map(node => (
                          <div 
                            key={node.type} 
                            onClick={() => {
                              const newNode = {
                                id: Date.now().toString(),
                                type: node.type,
                                label: `New ${node.label}`,
                                content: '',
                                buttons: node.type === 'BUTTONS' ? ['Button 1'] : null,
                                fields: node.type === 'FORM' ? ['Full Name'] : null,
                                mediaUrl: (node.type === 'IMAGE' || node.type === 'VIDEO') ? '' : undefined,
                                x: 100,
                                y: 100,
                              };
                              setSelectedWorkflow(prev => ({
                                ...prev,
                                nodes: [...prev.nodes, newNode]
                              }));
                            }}
                            className="group flex items-center gap-5 p-5 rounded-[28px] border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-100/20"
                          >
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-lg shadow-current/10", node.color)}>
                              <node.icon size={20} />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-bold text-slate-800 block">{node.label}</span>
                              <span className="text-[10px] text-slate-400 font-medium">Click to add block</span>
                            </div>
                            <Plus size={18} className="text-slate-200 group-hover:text-purple-400 transition-all" />
                          </div>
                        ))}
                    </div>
                  </div>
                </aside>

                {/* Main Canvas Area */}
                <main className="flex-1 relative overflow-hidden flex flex-col">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                  
                  {activeTab === 'DESIGN' ? (
                    <div className="w-full flex-1 relative overflow-hidden bg-slate-50/50 cursor-crosshair">
                      {/* PANNER LAYER */}
                      <motion.div 
                        drag={!connectingFrom}
                        dragConstraints={{ left: -3000, right: 3000, top: -3000, bottom: 3000 }}
                        dragElastic={0}
                        dragMomentum={false}
                        onClick={() => {
                          if (connectingFrom) setConnectingFrom(null);
                        }}
                        onContextMenu={(e) => {
                          if (connectingFrom) {
                            e.preventDefault();
                            setConnectingFrom(null);
                          }
                        }}
                        onMouseMove={(e) => {
                          if (connectingFrom) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMousePos({
                              x: (e.clientX - rect.left) / zoom,
                              y: (e.clientY - rect.top) / zoom
                            });
                          }
                        }}
                        className="absolute inset-0 w-[6000px] h-[6000px] origin-center"
                        initial={{ x: -2500, y: -2500 }}
                      >
                        {/* ZOOMER LAYER */}
                        <motion.div 
                          animate={{ scale: zoom }}
                          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
                          className="w-full h-full relative origin-center"
                        >
                      {/* SVG Connections Layer */}
                      <svg className="absolute inset-0 pointer-events-none w-full h-full">
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                          </marker>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>

                        {/* PREVIEW WIRE (When connecting) */}
                        {connectingFrom && (
                          <g>
                            {(() => {
                              const fromId = connectingFrom?.id || connectingFrom;
                              const fromPort = connectingFrom?.port;
                              const fromNode = selectedWorkflow.nodes.find(n => n.id === fromId);
                              if (!fromNode) return null;
                              
                              const isButton = fromPort !== undefined;
                              const start = isButton 
                                ? getPortPosition(fromNode, 'button', fromPort)
                                : getPortPosition(fromNode, 'output', 0);
                              
                              const endX = mousePos.x;
                              const endY = mousePos.y;
                              
                              let path;
                              if (isButton) {
                                const dx = Math.abs(endX - start.x);
                                const curveOut = Math.min(dx * 0.5, 150);
                                path = `M ${start.x} ${start.y} C ${start.x + curveOut} ${start.y}, ${endX} ${endY - curveOut}, ${endX} ${endY}`;
                              } else {
                                const dy = Math.abs(endY - start.y) / 1.5;
                                path = `M ${start.x} ${start.y} C ${start.x} ${start.y + dy}, ${endX} ${endY - dy}, ${endX} ${endY}`;
                              }
                              return (
                                <path 
                                  d={path} 
                                  stroke="#3b82f6" 
                                  strokeWidth="4" 
                                  fill="none" 
                                  strokeDasharray="8 8"
                                  className="opacity-50"
                                />
                              );
                            })()}
                          </g>
                        )}

                        {selectedWorkflow.connections?.map((conn, ci) => {
                          const fromNode = selectedWorkflow.nodes.find(n => n.id === conn.from);
                          const toNode = selectedWorkflow.nodes.find(n => n.id === conn.to);
                          if (!fromNode || !toNode) return null;

                          // Use helper for accurate port positions
                          const isButton = conn.fromPort !== undefined;
                          const start = isButton
                            ? getPortPosition(fromNode, 'button', conn.fromPort)
                            : getPortPosition(fromNode, 'output', 0);
                          const end = getPortPosition(toNode, 'input', 0);
                          
                          const sX = start.x;
                          const sY = start.y;
                          const eX = end.x;
                          const eY = end.y;

                          // Smart Curvature
                          const dist = Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2));
                          const curvature = Math.min(dist * 0.4, 150);
                          
                          // Path Construction
                          let path = "";
                          if (isButton) {
                            path = `M ${sX} ${sY} C ${sX + curvature} ${sY}, ${eX} ${eY - curvature}, ${eX} ${eY}`;
                          } else {
                            path = `M ${sX} ${sY} C ${sX} ${sY + curvature}, ${eX} ${eY - curvature}, ${eX} ${eY}`;
                          }

                          const midX = (sX + eX) / 2;
                          const midY = (sY + eY) / 2;

                          return (
                            <g 
                              key={`conn-${conn.from}-${conn.to}-${ci}`} 
                              className="pointer-events-auto cursor-pointer group" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWorkflow(prev => ({
                                  ...prev,
                                  connections: prev.connections.filter((_, i) => i !== ci)
                                }));
                              }}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              {/* Background "Glow" line */}
                              <path 
                                d={path} 
                                stroke={isDragging ? "#f1f5f9" : "#3b82f6"} 
                                strokeWidth="8" 
                                fill="none" 
                                className="opacity-0 group-hover:opacity-20 transition-opacity" 
                              />
                              
                              {/* Main Wire */}
                              <path 
                                d={path} 
                                stroke={isDragging ? "#cbd5e1" : "#cbd5e1"} 
                                strokeWidth="3" 
                                fill="none" 
                                strokeLinecap="round" 
                                markerEnd="url(#arrowhead)"
                                className="group-hover:stroke-rose-400 transition-colors" 
                              />

                              {/* Animated Flow */}
                              <path 
                                d={path} 
                                stroke="#3b82f6" 
                                strokeWidth="3" 
                                fill="none" 
                                filter="url(#glow)" 
                                markerEnd="url(#arrowhead)" 
                                className={cn("animate-[dash_3s_linear_infinite]", isDragging ? "opacity-20" : "opacity-100")} 
                                strokeDasharray="10 60" 
                              />
                              
                              {/* Delete Handle (X) */}
                              <circle cx={midX} cy={midY} r="14" className="fill-white stroke-rose-500 stroke-2 opacity-0 group-hover:opacity-100 transition-all shadow-xl" />
                              <text x={midX} y={midY + 4} textAnchor="middle" className="fill-rose-500 text-[12px] font-black opacity-0 group-hover:opacity-100 pointer-events-none transition-all">×</text>

                              {/* Interaction Hit Area */}
                              <path d={path} stroke="transparent" strokeWidth="30" fill="none" className="cursor-pointer" />
                            </g>
                          );
                        })}
                      </svg>

                      {selectedWorkflow.nodes.map((node) => (
                        <WorkflowNode 
                          key={node.id}
                          node={node}
                          zoom={zoom}
                          connectingFrom={connectingFrom}
                          setConnectingFrom={setConnectingFrom}
                          setSelectedWorkflow={setSelectedWorkflow}
                          setIsDragging={setIsDragging}
                          connections={selectedWorkflow.connections}
                        />
                      ))}
                    </motion.div>
                  </motion.div>
                </div>
                ) : (
                    <div className="flex-1 overflow-auto p-12 bg-slate-50/50">
                      <div className="max-w-6xl mx-auto space-y-12">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {[
                            { label: 'Total Flow Hits', value: '12,845', trend: '+12%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Completion Rate', value: '84.2%', trend: '+5%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Avg. Interaction', value: '42s', trend: '-2s', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
                          ].map((stat, i) => (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                                <stat.icon size={20} />
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                              <div className="flex items-baseline gap-3">
                                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                                <span className="text-[10px] font-bold text-emerald-500">{stat.trend}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Node-by-Node Analysis */}
                        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10">
                          <h3 className="text-xl font-bold text-slate-900 mb-8">Block Performance Breakdown</h3>
                          <div className="space-y-6">
                            {selectedWorkflow.nodes.map((node, i) => {
                              const hitCount = Math.floor(12845 * (1 - (i * 0.1)));
                              return (
                                <div key={node.id} className="flex items-center gap-6">
                                  <div className="w-12 text-[10px] font-black text-slate-300 italic">STEP {i+1}</div>
                                  <div className="flex-1 bg-slate-50 h-14 rounded-2xl relative overflow-hidden border border-slate-100 group">
                                    <div className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-1000" style={{ width: `${(hitCount/12845)*100}%` }} />
                                    <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
                                      <span className="text-xs font-bold text-slate-700 group-hover:text-white transition-colors">{node.label}</span>
                                      <span className="text-xs font-black text-slate-900 group-hover:text-white">{hitCount.toLocaleString()} hits</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-12 right-12 flex flex-col gap-4">
                    <div className="flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-1">
                      <button onClick={() => handleZoom('IN')} className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all border-b border-slate-50"><Plus size={20} /></button>
                      <button onClick={() => handleZoom('RESET')} className="w-12 h-12 flex items-center justify-center text-slate-900 font-bold text-[10px] hover:bg-slate-50 transition-all border-b border-slate-50">{Math.round(zoom * 100)}%</button>
                      <button onClick={() => handleZoom('OUT')} className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"><Minus size={20} /></button>
                    </div>
                    <button className="w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-900 border border-slate-100 hover:bg-slate-50 transition-all"><LayoutGrid size={24} /></button>
                  </div>
                </main>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isPreviewOpen && selectedWorkflow && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-10 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPreviewOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative bg-white w-full max-w-sm h-[800px] rounded-[60px] shadow-2xl border-[12px] border-slate-900 overflow-hidden flex flex-col"
            >
              {/* Phone Header */}
              <div className="h-28 bg-[#075E54] p-6 pt-12 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-200/20 flex items-center justify-center text-white"><ArrowRight className="rotate-180" size={20} /></div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"><MessageSquare size={20} /></div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedWorkflow.name}</h3>
                  <p className="text-[10px] text-white/70 font-medium tracking-widest uppercase">Online</p>
                </div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E5DDD5] custom-scrollbar">
                {selectedWorkflow.nodes.map((node, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                    key={node.id} 
                    className="flex flex-col items-start max-w-[85%]"
                  >
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-800 leading-relaxed relative overflow-hidden">
                      {node.mediaUrl && (
                        <div className="mb-3 -m-3 overflow-hidden">
                          {node.type === 'IMAGE' ? (
                            <img src={node.mediaUrl} alt="Media" className="w-full h-auto object-cover border-b border-slate-100" />
                          ) : (
                            <video src={node.mediaUrl} controls className="w-full h-auto object-cover border-b border-slate-100" />
                          )}
                        </div>
                      )}
                      {node.content}
                      <span className="text-[9px] text-slate-400 font-bold block text-right mt-1">12:00 PM</span>
                      <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent" />
                    </div>

                    {node.buttons && node.buttons.length > 0 && (
                      <div className="w-full mt-3 space-y-2">
                        {node.buttons.map((btn, bi) => (
                          <div key={bi} className="bg-white/80 backdrop-blur-md py-3 px-4 rounded-xl text-center text-blue-600 text-xs font-bold border border-white shadow-sm cursor-pointer hover:bg-white transition-all">
                            {btn}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Chat Footer */}
              <div className="p-4 bg-white/50 backdrop-blur-xl border-t border-white/20 flex items-center gap-3">
                <div className="flex-1 bg-white h-12 rounded-full px-5 flex items-center text-slate-300 text-sm italic">Type a message...</div>
                <div className="w-12 h-12 rounded-full bg-[#075E54] flex items-center justify-center text-white shadow-lg"><Zap size={20} /></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </>
  );
};

export default ClientWorkflowsPage;
