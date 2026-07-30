import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import api from "../lib/api";
import toast from "react-hot-toast";
import { CheckSquare, Search, X, Send, Activity } from "lucide-react";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/constants";

const BRAND = "#6366f1";

export default function TasksPage() {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const queryClient = useQueryClient();
  const isPrivileged = ["ADMIN", "MANAGER"].includes(user?.role);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [comment, setComment] = useState("");

  const cardBg = isDark ? "#1e293b" : "white";
  const cardBorder = isDark ? "#334155" : "#e2e8f0";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "white";
  const subBg = isDark ? "#0f172a" : "#f8fafc";

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", filterStatus, filterPriority],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filterPriority) params.append("priority", filterPriority);
      return api.get("/tasks?" + params.toString()).then(r => r.data);
    },
    retry: false,
    refetchInterval: 5000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put("/tasks/" + id, data),
    onSuccess: (res) => {
      invalidateAll();
      setSelectedTask(res.data.task);
      setEditForm(null);
      toast.success("Task updated!");
    },
    onError: err => toast.error(err.response?.data?.error || "Failed to update task"),
  });

  const commentMutation = useMutation({
    mutationFn: ({ taskId, content }) => api.post("/tasks/" + taskId + "/comments", { content }),
    onSuccess: (res) => {
      invalidateAll();
      setSelectedTask(prev => ({
        ...prev,
        comments: [...(prev?.comments || []), res.data.comment]
      }));
      setComment("");
      toast.success("Comment added!");
    },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const tasks = (data?.tasks || []).filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.project?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openTask = (task) => {
    setSelectedTask(task);
    setEditForm(null);
    setComment("");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{color: textMain}}>
          <CheckSquare className="w-6 h-6" style={{color: BRAND}} />
          {isPrivileged ? "All Tasks" : "My Tasks"}
        </h1>
        <p className="text-sm mt-1" style={{color: textMuted}}>{tasks.length} task{tasks.length !== 1 ? "s" : ""} · Live updates every 5s</p>
      </div>

      <div className="rounded-2xl p-4" style={{background: cardBg, border: "1px solid " + cardBorder}}>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color: textMuted}} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="input pl-9" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
              <button key={status} onClick={() => setFilterStatus(filterStatus === status ? "" : status)}
                className="px-3 py-2 rounded-xl text-xs font-medium border transition-all"
                style={filterStatus === status ? {background: BRAND, color: "white", borderColor: BRAND} : {background: subBg, color: textMuted, borderColor: cardBorder}}>
                {cfg.icon} {cfg.label}
              </button>
            ))}
            {Object.entries(PRIORITY_CONFIG).map(([p, cfg]) => (
              <button key={p} onClick={() => setFilterPriority(filterPriority === p ? "" : p)}
                className="px-3 py-2 rounded-xl text-xs font-medium border transition-all"
                style={filterPriority === p ? {background: BRAND, color: "white", borderColor: BRAND} : {background: subBg, color: textMuted, borderColor: cardBorder}}>
                {cfg.label}
              </button>
            ))}
            {(filterStatus || filterPriority || search) && (
              <button onClick={() => { setFilterStatus(""); setFilterPriority(""); setSearch(""); }}
                className="px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1"
                style={{color: BRAND, borderColor: BRAND, background: BRAND + "10"}}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{background: cardBg}} />)}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium" style={{color: textMain}}>No tasks found</p>
          <p className="text-sm mt-1" style={{color: textMuted}}>{isPrivileged ? "Create tasks inside a project" : "No tasks assigned to you yet"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => {
            const sc = STATUS_CONFIG[task.status];
            const pc = PRIORITY_CONFIG[task.priority];
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
            return (
              <div key={task.id} onClick={() => openTask(task)}
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                style={{background: cardBg, border: "1px solid " + (selectedTask?.id === task.id ? BRAND : cardBorder)}}
                onMouseEnter={e => e.currentTarget.style.borderColor = BRAND}
                onMouseLeave={e => e.currentTarget.style.borderColor = selectedTask?.id === task.id ? BRAND : cardBorder}>
                <span className="text-lg flex-shrink-0">{sc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{color: textMain, textDecoration: task.status === "DONE" ? "line-through" : "none"}}>{task.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs" style={{color: textMuted}}>{task.project?.name}</span>
                    {task.assignee && <span className="text-xs" style={{color: textMuted}}>→ {task.assignee.name}</span>}
                    {task.dueDate && (
                      <span className="text-xs" style={{color: isOverdue ? "#ef4444" : textMuted}}>
                        {isOverdue ? "⚠ Overdue · " : ""}{new Date(task.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short"})}
                      </span>
                    )}
                    {task.comments?.filter(c => !c.isSystem).length > 0 && (
                      <span className="text-xs" style={{color: textMuted}}>💬 {task.comments.filter(c => !c.isSystem).length}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                  style={{background: task.status === "DONE" ? "#dcfce7" : task.status === "IN_PROGRESS" ? "#dbeafe" : task.status === "IN_REVIEW" ? "#f3e8ff" : isDark ? "#334155" : "#f1f5f9",
                    color: task.status === "DONE" ? "#16a34a" : task.status === "IN_PROGRESS" ? "#1d4ed8" : task.status === "IN_REVIEW" ? "#7c3aed" : textMuted}}>
                  {sc.label}
                </span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                  style={{background: task.priority === "URGENT" ? "#fee2e2" : task.priority === "HIGH" ? "#ffedd5" : task.priority === "MEDIUM" ? "#fef9c3" : "#f0fdf4",
                    color: task.priority === "URGENT" ? "#dc2626" : task.priority === "HIGH" ? "#ea580c" : task.priority === "MEDIUM" ? "#ca8a04" : "#16a34a"}}>
                  {pc.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" style={{background: "rgba(0,0,0,0.4)"}}>
          <div className="h-full w-full max-w-xl flex flex-col" style={{background: cardBg, borderLeft: "1px solid " + cardBorder}}>
            <div className="flex items-center gap-3 p-5 flex-shrink-0" style={{borderBottom: "1px solid " + cardBorder}}>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base" style={{color: textMain}}>{selectedTask.title}</h2>
                <p className="text-xs mt-0.5" style={{color: textMuted}}>{selectedTask.project?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {isPrivileged && !editForm && (
                  <button onClick={() => setEditForm({
                    title: selectedTask.title,
                    description: selectedTask.description || "",
                    status: selectedTask.status,
                    priority: selectedTask.priority,
                    dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split("T")[0] : ""
                  })} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{background: BRAND + "15", color: BRAND}}>
                    Edit
                  </button>
                )}
                <button onClick={() => { setSelectedTask(null); setEditForm(null); }} className="p-2 rounded-lg" style={{color: textMuted}}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {editForm && isPrivileged ? (
                <div className="space-y-3 p-4 rounded-xl" style={{background: subBg, border: "1px solid " + BRAND + "30"}}>
                  <p className="text-xs font-bold" style={{color: BRAND}}>✏️ EDITING TASK</p>
                  <div>
                    <label className="label text-xs" style={{color: textMuted}}>Title</label>
                    <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                  </div>
                  <div>
                    <label className="label text-xs" style={{color: textMuted}}>Description</label>
                    <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={3} className="textarea" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs" style={{color: textMuted}}>Status</label>
                      <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                        {Object.entries(STATUS_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs" style={{color: textMuted}}>Priority</label>
                      <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                        {Object.entries(PRIORITY_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="label text-xs" style={{color: textMuted}}>Due Date</label>
                      <input type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditForm(null)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                    <button onClick={() => updateMutation.mutate({ id: selectedTask.id, ...editForm })} disabled={updateMutation.isPending}
                      className="flex-1 py-2 rounded-xl text-white text-sm font-medium flex items-center justify-center" style={{background: BRAND}}>
                      {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl" style={{background: subBg}}>
                    <p className="text-xs font-medium mb-2" style={{color: textMuted}}>Status</p>
                    {!isPrivileged ? (
                      <select value={selectedTask.status}
                        onChange={e => updateMutation.mutate({ id: selectedTask.id, status: e.target.value })}
                        className="input text-sm" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                        {Object.entries(STATUS_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold" style={{color: textMain}}>{STATUS_CONFIG[selectedTask.status]?.label}</p>
                    )}
                  </div>
                  <div className="p-3 rounded-xl" style={{background: subBg}}>
                    <p className="text-xs font-medium mb-2" style={{color: textMuted}}>Priority</p>
                    <p className="text-sm font-semibold" style={{color: textMain}}>{PRIORITY_CONFIG[selectedTask.priority]?.label}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{background: subBg}}>
                    <p className="text-xs font-medium mb-2" style={{color: textMuted}}>Assigned To</p>
                    <p className="text-sm font-semibold" style={{color: textMain}}>{selectedTask.assignee?.name || "Unassigned"}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{background: subBg}}>
                    <p className="text-xs font-medium mb-2" style={{color: textMuted}}>Due Date</p>
                    <p className="text-sm font-semibold" style={{color: textMain}}>
                      {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"}) : "No date"}
                    </p>
                  </div>
                </div>
              )}

              {selectedTask.description && !editForm && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{color: textMuted}}>DESCRIPTION</p>
                  <p className="text-sm leading-relaxed" style={{color: textMain}}>{selectedTask.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold mb-3 flex items-center gap-2" style={{color: textMuted}}>
                  <Activity className="w-3.5 h-3.5" /> ACTIVITY & COMMENTS
                </p>
                <div className="space-y-2 mb-4">
                  {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                    <p className="text-sm text-center py-4" style={{color: textMuted}}>No activity yet.</p>
                  )}
                  {selectedTask.comments?.map(c => (
                    c.isSystem ? (
                      <div key={c.id} className="flex items-center gap-2 py-1">
                        <div className="h-px flex-1" style={{background: cardBorder}} />
                        <span className="text-xs px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap" style={{background: subBg, color: textMuted}}>
                          <Activity className="w-3 h-3 flex-shrink-0" style={{color: BRAND}} />
                          <strong style={{color: textMain}}>{c.author.name}</strong>
                          <span>— {c.content}</span>
                          <span>· {new Date(c.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}</span>
                        </span>
                        <div className="h-px flex-1" style={{background: cardBorder}} />
                      </div>
                    ) : (
                      <div key={c.id} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{background: BRAND}}>
                          {c.author.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-semibold" style={{color: textMain}}>{c.author.name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{background: c.author.role === "MANAGER" ? BRAND + "15" : isDark ? "#334155" : "#f1f5f9",
                                color: c.author.role === "MANAGER" ? BRAND : textMuted}}>
                              {c.author.role === "MANAGER" ? "Manager" : "Team Member"}
                            </span>
                            <span className="text-xs" style={{color: textMuted}}>
                              {new Date(c.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl text-sm" style={{background: subBg, color: textMain}}>{c.content}</div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1" style={{background: BRAND}}>
                    {user?.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input value={comment} onChange={e => setComment(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && comment.trim()) commentMutation.mutate({ taskId: selectedTask.id, content: comment }); }}
                      placeholder="Add comment... (Enter to send)"
                      className="input flex-1 text-sm" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                    <button onClick={() => comment.trim() && commentMutation.mutate({ taskId: selectedTask.id, content: comment })}
                      disabled={!comment.trim() || commentMutation.isPending}
                      className="p-2.5 rounded-xl text-white flex-shrink-0"
                      style={{background: BRAND, opacity: !comment.trim() ? 0.5 : 1}}>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}