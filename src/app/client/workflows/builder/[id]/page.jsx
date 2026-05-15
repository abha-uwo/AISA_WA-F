'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  useNodesState,
  useEdgesState,
  Panel,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Save, MessageSquare, Clock, Zap, Loader2, 
  ChevronDown, Image as ImageIcon, Video, List, FileText, Webhook, Tag, BarChart3,
  MousePointer2, ArrowLeft, CheckCircle2, XCircle, Play, X, Plus, Trash2, Edit3
} from 'lucide-react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// --- CUSTOM NODE WRAPPER ---
const NodeContainer = ({ children, title, icon: Icon, color, id, isTrigger }) => {
  const { deleteElements } = useReactFlow();
  const onDelete = (e) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-64 group relative animate-in fade-in zoom-in duration-200">
      <div className={cn("px-4 py-2.5 flex items-center justify-between border-b border-slate-100", color)}>
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{title}</span>
        </div>
        {!isTrigger && (
          <button onClick={onDelete} className="w-5 h-5 bg-white/20 hover:bg-red-500 text-white rounded-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm">
            <X size={12} strokeWidth={3} />
          </button>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

// --- NODE TYPES ---

const TriggerNode = ({ id, data = {} }) => (
  <div className="bg-slate-900 rounded-xl shadow-2xl p-5 w-64 border-b-4 border-b-emerald-500 group relative">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center"><Zap size={16} fill="currentColor" /></div>
      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Start Flow</h4>
    </div>
    <div className="bg-slate-800 rounded-lg p-2.5 border border-slate-700">
      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest truncate">"{data.keyword || 'Any Keyword'}"</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 -bottom-1" />
  </div>
);

const PlainNode = ({ id, data = {} }) => (
  <NodeContainer id={id} title="Message" icon={MessageSquare} color="bg-blue-600">
    <p className="text-xs font-semibold text-slate-700 leading-relaxed line-clamp-3">"{data.message || 'Enter message...'}"</p>
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-400 border-2 border-white -top-1" />
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-blue-600 border-2 border-white -bottom-1" />
  </NodeContainer>
);

const ButtonsNode = ({ id, data = {} }) => (
  <NodeContainer id={id} title="Buttons" icon={MousePointer2} color="bg-indigo-600">
    <p className="text-[11px] font-semibold text-slate-700 mb-4 line-clamp-2">"{data.message || 'Options...'}"</p>
    <div className="space-y-2">
      {(data.buttons || ['Option 1']).map((btn, i) => (
        <div key={i} className="relative">
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[9px] font-bold text-indigo-600 uppercase tracking-widest text-center">{btn}</div>
          <Handle type="source" position={Position.Right} id={`btn-${i}`} className="w-2 h-2 bg-indigo-500 border-2 border-white -right-1" />
        </div>
      ))}
    </div>
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-400 border-2 border-white -top-1" />
  </NodeContainer>
);

const ImageNode = ({ id, data = {} }) => (
  <NodeContainer id={id} title="Image" icon={ImageIcon} color="bg-purple-600">
    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-2 border border-dashed border-slate-200">
      <ImageIcon size={20} className="text-slate-300" />
    </div>
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-400 border-2 border-white -top-1" />
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-purple-600 border-2 border-white -bottom-1" />
  </NodeContainer>
);

const BranchNode = ({ id, data = {} }) => (
  <NodeContainer id={id} title="Condition" icon={Zap} color="bg-amber-500">
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3 text-center">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check Logic</p>
      <p className="text-[10px] font-bold text-slate-700 uppercase">{data.condition || 'IF TAG = VIP'}</p>
    </div>
    <div className="flex justify-between items-center px-2">
      <CheckCircle2 size={16} className="text-emerald-500" />
      <XCircle size={16} className="text-red-500" />
    </div>
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-400 border-2 border-white -top-1" />
    <Handle type="source" position={Position.Right} id="true" style={{ top: '75%' }} className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white -right-1" />
    <Handle type="source" position={Position.Right} id="false" style={{ top: '75%', right: '-34px' }} className="w-2.5 h-2.5 bg-red-500 border-2 border-white -right-1" />
  </NodeContainer>
);

// --- MAIN BUILDER ---

const WorkflowBuilderInner = () => {
  const { id } = useParams();
  const router = useRouter();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflow, setWorkflow] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  
  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = useMemo(() => ({
    trigger: TriggerNode,
    plain: PlainNode,
    default: PlainNode,
    buttons: ButtonsNode,
    image: ImageNode,
    condition: BranchNode,
  }), []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:8080/api/workflows/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setWorkflow(res.data);
      let steps = res.data.steps;
      if (typeof steps === 'string') try { steps = JSON.parse(steps); } catch(e) { steps = {}; }
      if (steps && Array.isArray(steps.nodes) && steps.nodes.length > 0) {
        setNodes(steps.nodes.map(n => ({ 
          ...n, 
          data: n.data || {}, 
          position: n.position || {x:0, y:0}, 
          type: (!n.type || n.type === 'default') ? 'plain' : n.type 
        })));
        setEdges(Array.isArray(steps.edges) ? steps.edges : []);
      } else {
        setNodes([{ id: 'start', type: 'trigger', position: {x:250, y:50}, data: { keyword: 'Any Keyword' } }]);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const onConnect = useCallback((p) => setEdges((eds) => addEdge({ ...p, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)), [setEdges]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      await axios.patch(`http://127.0.0.1:8080/api/workflows/${id}/`, { steps: { nodes, edges } }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { alert('Save failed'); } finally { setIsSaving(false); }
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      position,
      data: { message: 'Type your message here...', buttons: ['Option 1'], keyword: 'hello', condition: 'If Tag = VIP' },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes]);

  const onNodeDoubleClick = (_, node) => setSelectedNode(node);
  const updateNodeData = (nodeId, newData) => {
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node));
    setSelectedNode(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={30} /></div>;

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden font-sans text-slate-900">
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/client/workflows')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-widest transition-colors"><ArrowLeft size={14} /> Go back</button>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase tracking-[0.1em]">{workflow?.name}</h1>
        </div>
        <button onClick={handleSave} className="px-8 py-3 bg-[#065f46] text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-100 flex items-center gap-2">{isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={14} />} Save Workflow</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50"><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Actions</h3></div>
          <div className="flex-1">
             <SidebarCategory title="Messages" icon={MessageSquare} expanded>
                <SidebarItem icon={MessageSquare} label="Plain Message" onDragStart={(e) => onDragStart(e, 'plain')} />
                <SidebarItem icon={MousePointer2} label="Message + Buttons" onDragStart={(e) => onDragStart(e, 'buttons')} />
                <SidebarItem icon={ImageIcon} label="Message + Image" onDragStart={(e) => onDragStart(e, 'image')} />
             </SidebarCategory>
             <div className="px-4 py-2 mt-4"><SidebarItem icon={Zap} label="Set a Condition" onDragStart={(e) => onDragStart(e, 'condition')} color="amber" /></div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-[#f1f5f9]" ref={reactFlowWrapper}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} onNodeDoubleClick={onNodeDoubleClick} fitView>
            <Background color="#cbd5e1" gap={25} size={1} variant="dots" />
            <Controls className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden m-8" />
          </ReactFlow>
        </div>

        {/* Edit Drawer (Truncated logic for brevity) */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-20">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-black uppercase tracking-widest">Edit Step</h3>
                <button onClick={() => setSelectedNode(null)}><X size={20} /></button>
              </div>
              <div className="p-8">
                <MessageForm data={selectedNode.data} onSave={(d) => updateNodeData(selectedNode.id, d)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- FORM COMPONENT ---
const MessageForm = ({ data, onSave }) => {
  const [msg, setMsg] = useState(data.message || '');
  return (<div className="space-y-6">
    <div><label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Message Content</label>
    <textarea value={msg} onChange={e => setMsg(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-xl text-sm font-bold focus:border-blue-600 outline-none" rows={4} /></div>
    <button onClick={() => onSave({ message: msg })} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all">Save Changes</button>
  </div>);
};

const SidebarCategory = ({ title, icon: Icon, expanded, children }) => (
  <div>
    <div className="w-full p-5 flex items-center gap-3 bg-slate-50/30 text-blue-600">
      <Icon size={18} /><span className="text-xs font-black uppercase tracking-widest">{title}</span>
    </div>
    <div className="overflow-hidden">{children}</div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, onDragStart, color = "slate" }) => (
  <div draggable={!!onDragStart} onDragStart={onDragStart} className="w-full p-4 pl-12 flex items-center gap-4 group cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-all">
    <Icon size={16} className={cn("text-slate-400 group-hover:text-blue-600")} />
    <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 uppercase tracking-widest">{label}</span>
  </div>
);

const WorkflowBuilder = () => (<ReactFlowProvider><WorkflowBuilderInner /></ReactFlowProvider>);

export default WorkflowBuilder;
