import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import api from "../lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Send, ChevronDown, Calendar, User, Flag, MessageSquare, Edit2, Trash2, X, Check } from "lucide-react";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/constants";

const BRAND = "#6366f1";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const queryClient = useQueryClient();
  const isPrivileged = ["ADMIN", "MANAGER"].includes(user?.role);

  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM", status: "TODO", assigneeId: "", dueDate: "" });
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const bg = isDark ? "#020b18" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "white";
  const cardBorder = isDark ? "#334155" : "#e2e8f0";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "white";
  const hoverBg = isDark ? "#243044" : "#f8fafc";

  const { data, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => api.get("/projects/" + id).then(r => r.data),
  });

  const commentMutation = useMutation({
    mutationFn: ({ taskId, content }) => api.post("/tasks/" + taskId + "/comments", { content }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["project", id] }); setComment(""); toast.success("Comment added!"); },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => api.post("/tasks", { ...data, projectId: id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["project", id] }); setShowAddTask(false); setTaskForm({ title: "", description: "", priority: "MEDIUM", status: "TODO", assigneeId: "", dueDate: "" }); toast.success("Task created!"); },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, ...data }) => api.put("/tasks/" + taskId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setSelectedTask(res.data.task);
      setEditingTask(null);
      toast.success("Task updated!");
    },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => api.delete("/tasks/" + taskId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["project", id] }); setSelectedTask(null); toast.success("Task deleted"); },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const project = data?.project;
  const members = project?.members || [];
  const tasks = project?.tasks || [];
  const filteredTasks = filterStatus === "ALL" ? tasks : tasks.filter(t => t.status === filterStatus);

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s).length;
    return acc;
  }, {});

  if (isLoading) return (
    <div className="space-y-4">
      <div className="h-10 w-48 rounded-xl animate-pulse" style={{background: cardBg}} />
      <div className="h-40 rounded-2xl animate-pulse" style={{background: cardBg}} />
    </div>
  );

  if (!project) return (
    <div className="text-center py-20">
      <p style={{color: textMuted}}>Project not found or access denied.</p>
      <button onClick={() => navigate("/projects")} className="btn-primary mt-4">Back to Projects</button>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/projects")} className="p-2 rounded-xl hover:bg-slate-100 transition-colors" style={{color: textMuted}}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{background: project.color}} />
        <h1 className="text-xl font-bold truncate" style={{color: textMain}}>{project.name}</h1>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {members.slice(0,5).map(m => (
            <div key={m.user.id} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white" style={{background: BRAND}} title={m.user.name}>
              {m.user.name[0].toUpperCase()}
            </div>
          ))}
          <span className="text-sm" style={{color: textMuted}}>{members.length} members</span>
        </div>
      </div>

      {project.description && (
        <div className="p-4 rounded-xl text-sm" style={{background: cardBg, border: "1px solid " + cardBorder, color: textMuted}}>
          {project.description}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className="p-4 rounded-xl text-center cursor-pointer transition-all" style={{background: filterStatus === status ? BRAND : cardBg, border: "1px solid " + (filterStatus === status ? BRAND : cardBorder)}}
            onClick={() => setFilterStatus(filterStatus === status ? "ALL" : status)}>
            <p className="text-2xl font-bold" style={{color: filterStatus === status ? "white" : textMain}}>{statusCounts[status]}</p>
            <p className="text-xs mt-0.5" style={{color: filterStatus === status ? "rgba(255,255,255,0.8)" : textMuted}}>{cfg.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold" style={{color: textMain}}>
          Tasks {filterStatus !== "ALL" && <span style={{color: BRAND}}>· {STATUS_CONFIG[filterStatus]?.label}</span>}
          <span className="ml-2 text-sm font-normal" style={{color: textMuted}}>({filteredTasks.length})</span>
        </h2>
        {isPrivileged && (
          <button onClick={() => setShowAddTask(true)} className="btn-primary text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
            <p className="text-4xl mb-2">📋</p>
            <p style={{color: textMuted}}>No tasks yet</p>
          </div>
        ) : filteredTasks.map(task => {
          const sc = STATUS_CONFIG[task.status];
          const pc = PRIORITY_CONFIG[task.priority];
          return (
            <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all" style={{background: cardBg, border: "1px solid " + (selectedTask?.id === task.id ? BRAND : cardBorder)}}
              onMouseEnter={e => e.currentTarget.style.borderColor = BRAND}
              onMouseLeave={e => e.currentTarget.style.borderColor = selectedTask?.id === task.id ? BRAND : cardBorder}>
              <span className="text-lg flex-shrink-0">{sc.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{color: textMain}}>{task.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs" style={{color: textMuted}}>{task.assignee?.name || "Unassigned"}</span>
                  {task.dueDate && <span className="text-xs" style={{color: new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "#ef4444" : textMuted}}>
                    {new Date(task.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short"})}
                  </span>}
                  {task.comments?.length > 0 && <span className="text-xs flex items-center gap-1" style={{color: textMuted}}><MessageSquare className="w-3 h-3" />{task.comments.length}</span>}
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{background: sc.badge?.split(" ")[0]?.replace("bg-","") === sc.badge ? "#f1f5f9" : "", color: BRAND,
                ...(task.status === "DONE" ? {background: "#dcfce7", color: "#16a34a"} :
                   task.status === "IN_PROGRESS" ? {background: "#dbeafe", color: "#1d4ed8"} :
                   task.status === "IN_REVIEW" ? {background: "#f3e8ff", color: "#7c3aed"} :
                   {background: isDark ? "#334155" : "#f1f5f9", color: textMuted})}}>
                {sc.label}
              </span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                style={{
                  background: task.priority === "URGENT" ? "#fee2e2" : task.priority === "HIGH" ? "#ffedd5" : task.priority === "MEDIUM" ? "#fef9c3" : "#f0fdf4",
                  color: task.priority === "URGENT" ? "#dc2626" : task.priority === "HIGH" ? "#ea580c" : task.priority === "MEDIUM" ? "#ca8a04" : "#16a34a"
                }}>
                {pc.label}
              </span>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" style={{background: "rgba(0,0,0,0.4)"}}>
          <div className="h-full w-full max-w-xl flex flex-col overflow-hidden" style={{background: cardBg, borderLeft: "1px solid " + cardBorder}}>
            <div className="flex items-center gap-3 p-5" style={{borderBottom: "1px solid " + cardBorder}}>
              <div className="flex-1 min-w-0">
                {editingTask ? (
                  <input value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="input w-full" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                ) : (
                  <h2 className="font-bold text-lg" style={{color: textMain}}>{selectedTask.title}</h2>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {isPrivileged && !editingTask && (
                  <button onClick={() => setEditingTask({...selectedTask})} className="p-2 rounded-lg" style={{color: textMuted}}><Edit2 className="w-4 h-4" /></button>
                )}
                {isPrivileged && !editingTask && (
                  <button onClick={() => { if(confirm("Delete this task?")) deleteTaskMutation.mutate(selectedTask.id); }} className="p-2 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                )}
                {editingTask && (
                  <>
                    <button onClick={() => updateTaskMutation.mutate({ taskId: selectedTask.id, title: editingTask.title, description: editingTask.description, status: editingTask.status, priority: editingTask.priority, assigneeId: editingTask.assigneeId || editingTask.assignee?.id, dueDate: editingTask.dueDate || selectedTask.dueDate })} className="p-2 rounded-lg text-green-500"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingTask(null)} className="p-2 rounded-lg" style={{color: textMuted}}><X className="w-4 h-4" /></button>
                  </>
                )}
                <button onClick={() => { setSelectedTask(null); setEditingTask(null); }} className="p-2 rounded-lg" style={{color: textMuted}}><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl space-y-1" style={{background: isDark ? "#0f172a" : "#f8fafc"}}>
                  <p className="text-xs font-medium" style={{color: textMuted}}>Status</p>
                  {editingTask ? (
                    <select value={editingTask.status} onChange={e => setEditingTask({...editingTask, status: e.target.value})} className="input text-xs py-1" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                      {Object.entries(STATUS_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  ) : <p className="text-sm font-semibold" style={{color: textMain}}>{STATUS_CONFIG[selectedTask.status]?.label}</p>}
                </div>
                <div className="p-3 rounded-xl space-y-1" style={{background: isDark ? "#0f172a" : "#f8fafc"}}>
                  <p className="text-xs font-medium" style={{color: textMuted}}>Priority</p>
                  {editingTask ? (
                    <select value={editingTask.priority} onChange={e => setEditingTask({...editingTask, priority: e.target.value})} className="input text-xs py-1" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                      {Object.entries(PRIORITY_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  ) : <p className="text-sm font-semibold" style={{color: textMain}}>{PRIORITY_CONFIG[selectedTask.priority]?.label}</p>}
                </div>
                <div className="p-3 rounded-xl space-y-1" style={{background: isDark ? "#0f172a" : "#f8fafc"}}>
                  <p className="text-xs font-medium" style={{color: textMuted}}>Assigned To</p>
                  {editingTask ? (
                    <select value={editingTask.assigneeId || editingTask.assignee?.id || ""} onChange={e => setEditingTask({...editingTask, assigneeId: e.target.value})} className="input text-xs py-1" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                      <option value="">Unassigned</option>
                      {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                    </select>
                  ) : <p className="text-sm font-semibold" style={{color: textMain}}>{selectedTask.assignee?.name || "Unassigned"}</p>}
                </div>
                <div className="p-3 rounded-xl space-y-1" style={{background: isDark ? "#0f172a" : "#f8fafc"}}>
                  <p className="text-xs font-medium" style={{color: textMuted}}>Due Date</p>
                  {editingTask ? (
                    <input type="date" value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split("T")[0] : ""} onChange={e => setEditingTask({...editingTask, dueDate: e.target.value})} className="input text-xs py-1" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                  ) : <p className="text-sm font-semibold" style={{color: textMain}}>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"}) : "No date"}</p>}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold mb-2" style={{color: textMuted}}>DESCRIPTION</p>
                {editingTask ? (
                  <textarea value={editingTask.description || ""} onChange={e => setEditingTask({...editingTask, description: e.target.value})} rows={3} className="textarea w-full" style={{background: inputBg, color: textMain, borderColor: cardBorder}} placeholder="Add description..." />
                ) : (
                  <p className="text-sm leading-relaxed" style={{color: selectedTask.description ? textMain : textMuted}}>
                    {selectedTask.description || "No description provided."}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold mb-3 flex items-center gap-2" style={{color: textMuted}}>
                  <MessageSquare className="w-3.5 h-3.5" /> COMMENTS ({selectedTask.comments?.length || 0})
                </p>
                <div className="space-y-3 mb-4">
                  {selectedTask.comments?.length === 0 && (
                    <p className="text-sm text-center py-4" style={{color: textMuted}}>No comments yet. Be the first to add one!</p>
                  )}
                  {selectedTask.comments?.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background: BRAND}}>
                        {c.author.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold" style={{color: textMain}}>{c.author.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{background: c.author.role === "MANAGER" ? "rgba(232,56,45,0.1)" : isDark ? "#334155" : "#f1f5f9", color: c.author.role === "MANAGER" ? BRAND : textMuted}}>
                            {c.author.role === "MANAGER" ? "Manager" : "Team Member"}
                          </span>
                          <span className="text-xs" style={{color: textMuted}}>{new Date(c.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}</span>
                        </div>
                        <div className="p-3 rounded-xl text-sm" style={{background: isDark ? "#0f172a" : "#f8fafc", color: textMain}}>
                          {c.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1" style={{background: BRAND}}>
                    {user?.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && comment.trim()) commentMutation.mutate({ taskId: selectedTask.id, content: comment }); }}
                      placeholder="Add a comment or update..." className="input flex-1 text-sm" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                    <button onClick={() => comment.trim() && commentMutation.mutate({ taskId: selectedTask.id, content: comment })} disabled={!comment.trim() || commentMutation.isPending} className="p-2.5 rounded-xl text-white flex-shrink-0" style={{background: BRAND, opacity: !comment.trim() ? 0.5 : 1}}>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTask && isPrivileged && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: "rgba(0,0,0,0.5)"}}>
          <div className="w-full max-w-lg rounded-2xl p-6" style={{background: cardBg, border: "1px solid " + cardBorder}}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{color: textMain}}>Add New Task</h2>
              <button onClick={() => setShowAddTask(false)} className="p-2 rounded-xl" style={{color: textMuted}}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label" style={{color: textMuted}}>Task Title *</label>
                <input value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} placeholder="e.g. Configure Fiori Gateway" className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
              </div>
              <div>
                <label className="label" style={{color: textMuted}}>Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows={3} placeholder="Task details..." className="textarea" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" style={{color: textMuted}}>Assign To</label>
                  <select value={taskForm.assigneeId} onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                    <option value="">Unassigned</option>
                    {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" style={{color: textMuted}}>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                    {Object.entries(PRIORITY_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" style={{color: textMuted}}>Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                    {Object.entries(STATUS_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" style={{color: textMuted}}>Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddTask(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={() => createTaskMutation.mutate(taskForm)} disabled={!taskForm.title || createTaskMutation.isPending} className="flex-1 py-2 rounded-xl text-white font-medium flex items-center justify-center" style={{background: BRAND, opacity: !taskForm.title ? 0.5 : 1}}>
                  {createTaskMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}