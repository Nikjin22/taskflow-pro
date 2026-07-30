import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Plus, FolderKanban, X, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PROJECT_COLORS } from "../lib/constants";

const BRAND = "#6366f1";

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isPrivileged = ["ADMIN", "MANAGER"].includes(user?.role);

  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", color: BRAND, dueDate: "", memberIds: [] });

  const cardBg = isDark ? "#1e293b" : "white";
  const cardBorder = isDark ? "#334155" : "#e2e8f0";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "white";
  const subBg = isDark ? "#0f172a" : "#f8fafc";

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects").then(r => r.data),
    retry: false,
  });

  const { data: usersData } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => api.get("/admin/users").then(r => r.data),
    enabled: isPrivileged,
  });

  const teamMembers = (usersData?.users || []).filter(u => u.role === "USER" && u.isActive);

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created!");
      setShowModal(false);
      resetForm();
    },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put("/projects/" + id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated!");
      setEditProject(null);
      resetForm();
    },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete("/projects/" + id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast.success("Project deleted"); },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const resetForm = () => setForm({ name: "", description: "", color: BRAND, dueDate: "", memberIds: [] });

  const openEdit = (project) => {
    setForm({
      name: project.name,
      description: project.description || "",
      color: project.color || BRAND,
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
      memberIds: project.members?.filter(m => m.role !== "OWNER").map(m => m.user.id) || [],
    });
    setEditProject(project);
  };

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(id) ? f.memberIds.filter(m => m !== id) : [...f.memberIds, id]
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Project name is required"); return; }
    if (editProject) {
      updateMutation.mutate({ id: editProject.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const projects = data?.projects || [];

  const getStatusColor = (status) => {
    if (status === "DONE") return "#10b981";
    if (status === "IN_PROGRESS") return "#3b82f6";
    if (status === "IN_REVIEW") return "#8b5cf6";
    return "#94a3b8";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{color: textMain}}>Projects</h1>
          <p className="text-sm mt-1" style={{color: textMuted}}>Workspace · {projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {isPrivileged && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{background: cardBg}} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
          <FolderKanban className="w-12 h-12 mx-auto mb-4" style={{color: textMuted}} />
          <h3 className="font-semibold text-lg mb-2" style={{color: textMain}}>No projects yet</h3>
          <p className="text-sm mb-6" style={{color: textMuted}}>Create your first project to get started</p>
          {isPrivileged && (
            <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const totalTasks = project._count?.tasks || 0;
            const members = project.members || [];
            const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== "DONE";
            return (
              <div key={project.id} className="rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all group" style={{background: cardBg, border: "1px solid " + cardBorder}}
                onClick={() => navigate("/projects/" + project.id)}>
                <div className="h-2 w-full" style={{background: project.color || BRAND}} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" style={{color: textMain}}>{project.name}</h3>
                      {project.description && (
                        <p className="text-xs mt-1 line-clamp-2" style={{color: textMuted}}>{project.description}</p>
                      )}
                    </div>
                    {isPrivileged && (
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg text-xs" style={{color: textMuted, background: subBg}}>✏️</button>
                        <button onClick={() => { if(confirm("Delete " + project.name + "?")) deleteMutation.mutate(project.id); }} className="p-1.5 rounded-lg text-xs" style={{color: "#ef4444", background: subBg}}>🗑️</button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{background: getStatusColor(project.status)}} />
                      <span className="text-xs" style={{color: textMuted}}>{totalTasks} tasks</span>
                    </div>
                    {project.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{color: isOverdue ? "#ef4444" : textMuted}} />
                        <span className="text-xs" style={{color: isOverdue ? "#ef4444" : textMuted}}>
                          {new Date(project.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"})}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {members.slice(0, 4).map((m) => (
                        <div key={m.user.id} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold border-2" style={{background: BRAND, borderColor: cardBg}} title={m.user.name}>
                          {m.user.name[0].toUpperCase()}
                        </div>
                      ))}
                      {members.length > 4 && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2" style={{background: subBg, borderColor: cardBg, color: textMuted}}>
                          +{members.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium" style={{color: textMuted}}>{members.length} member{members.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showModal || editProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: "rgba(0,0,0,0.5)"}}>
          <div className="w-full max-w-md rounded-2xl shadow-xl flex flex-col" style={{background: cardBg, border: "1px solid " + cardBorder, maxHeight: "90vh"}}>

            {/* FIXED HEADER */}
            <div className="flex items-center justify-between p-5 flex-shrink-0" style={{borderBottom: "1px solid " + cardBorder}}>
              <h2 className="text-lg font-bold" style={{color: textMain}}>{editProject ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => { setShowModal(false); setEditProject(null); resetForm(); }} className="p-2 rounded-xl" style={{color: textMuted}}><X className="w-4 h-4" /></button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="label" style={{color: textMuted}}>Project Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Stage Gate Management System" className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
              </div>
              <div>
                <label className="label" style={{color: textMuted}}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="What is this project about?" className="textarea" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
              </div>
              <div>
                <label className="label" style={{color: textMuted}}>Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
              </div>
              <div>
                <label className="label" style={{color: textMuted}}>Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_COLORS.map(c => (
                    <button key={c} onClick={() => setForm({...form, color: c})} className="w-8 h-8 rounded-full transition-all" style={{background: c, outline: form.color === c ? "3px solid " + c : "none", outlineOffset: "2px", transform: form.color === c ? "scale(1.2)" : "scale(1)"}} />
                  ))}
                </div>
              </div>
              {isPrivileged && teamMembers.length > 0 && (
                <div>
                  <label className="label flex items-center gap-2" style={{color: textMuted}}><Users className="w-3.5 h-3.5" /> Assign Team Members</label>
                  <div className="space-y-2 mt-1">
                    {teamMembers.map(m => (
                      <label key={m.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all" style={{background: form.memberIds.includes(m.id) ? BRAND + "15" : subBg, border: "1px solid " + (form.memberIds.includes(m.id) ? BRAND : cardBorder)}}>
                        <input type="checkbox" checked={form.memberIds.includes(m.id)} onChange={() => toggleMember(m.id)} style={{accentColor: BRAND}} />
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background: BRAND}}>
                          {m.name[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium" style={{color: textMain}}>{m.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FIXED FOOTER - always visible */}
            <div className="flex gap-3 p-5 flex-shrink-0" style={{borderTop: "1px solid " + cardBorder}}>
              <button onClick={() => { setShowModal(false); setEditProject(null); resetForm(); }} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || !form.name.trim()} className="flex-1 py-2.5 rounded-xl text-white font-medium flex items-center justify-center gap-2" style={{background: BRAND, opacity: !form.name.trim() ? 0.5 : 1}}>
                {(createMutation.isPending || updateMutation.isPending)
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : editProject ? "Save Changes" : "Create Project"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}