import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Shield, Users, LayoutGrid, BarChart2, Plus, X, Eye, EyeOff, Key, UserCog, Trash2, UserCheck, UserX, ChevronRight } from "lucide-react";
import { DEPARTMENTS, ROLES, STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/constants";

const BRAND = "#6366f1";
const MEMBER_COLORS = ["#6366f1","#10b981","#f59e0b","#3b82f6","#8b5cf6","#ec4899","#06b6d4","#f97316"];

export default function AdminPage() {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = ["ADMIN","SUPER_ADMIN"].includes(user?.role);
  const isManager = user?.role === "MANAGER";

  const [activeTab, setActiveTab] = useState("team");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "USER", department: "IT" });
  const [newPassword, setNewPassword] = useState("");

  const cardBg = isDark ? "#1e293b" : "white";
  const cardBorder = isDark ? "#334155" : "#e2e8f0";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "white";
  const subBg = isDark ? "#0f172a" : "#f8fafc";

  if (!["ADMIN","SUPER_ADMIN","MANAGER"].includes(user?.role)) {
    navigate("/dashboard");
    return null;
  }

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users").then(r => r.data),
  });

  const { data: statsData } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats").then(r => r.data),
  });

  const { data: allTasksData } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => api.get("/tasks").then(r => r.data),
  });

  const { data: allProjectsData } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => api.get("/projects").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User created!");
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", role: "USER", department: "IT" });
    },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch("/admin/users/" + id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Updated!"); setShowEditModal(null); },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }) => api.patch("/admin/users/" + id + "/password", { newPassword }),
    onSuccess: () => { toast.success("Password reset!"); setShowResetModal(null); setNewPassword(""); },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete("/admin/users/" + id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User deleted"); },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch("/admin/users/" + id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const allTasks = allTasksData?.tasks || [];
  const allProjects = allProjectsData?.projects || [];
  const teamMembers = (usersData?.users || []).filter(u => u.role === "USER" && u.isActive);

  const getMemberColor = (index) => MEMBER_COLORS[index % MEMBER_COLORS.length];

  const getMemberTasks = (memberId) => allTasks.filter(t => t.assigneeId === memberId);

  const tabs = [
    { id: "team", label: "Team View", icon: Users, show: true },
    { id: "board", label: "Board View", icon: LayoutGrid, show: true },
    { id: "overview", label: "Overview", icon: BarChart2, show: true },
    { id: "users", label: "Manage Users", icon: UserCog, show: isAdmin },
  ].filter(t => t.show);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{background: BRAND}}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color: textMain}}>{isAdmin ? "Admin Panel" : "Team Management"}</h1>
            <p className="text-sm" style={{color: textMuted}}>Workspace · {teamMembers.length} team members</p>
          </div>
        </div>
        {isAdmin && activeTab === "users" && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create User
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Team Members", value: teamMembers.length },
          { label: "Total Projects", value: allProjects.length },
          { label: "Total Tasks", value: allTasks.length },
          { label: "Completed", value: allTasks.filter(t => t.status === "DONE").length },
        ].map(({ label, value }) => (
          <div key={label} className="p-5 rounded-2xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
            <p className="text-sm" style={{color: textMuted}}>{label}</p>
            <p className="text-3xl font-bold mt-1" style={{color: BRAND}}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{background: subBg}}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={activeTab === id ? { background: cardBg, color: BRAND, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: textMuted }}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {activeTab === "team" && (
        <div className="space-y-4">
          <p className="text-sm" style={{color: textMuted}}>Click on a team member to filter their tasks. See everyone&apos;s workload at a glance.</p>
          <div className="flex flex-wrap gap-3 mb-2">
            <button onClick={() => setSelectedMember(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
              style={!selectedMember ? {background: BRAND, color: "white", borderColor: BRAND} : {background: cardBg, color: textMuted, borderColor: cardBorder}}>
              All Members
            </button>
            {teamMembers.map((m, i) => {
              const mTasks = getMemberTasks(m.id);
              const doneTasks = mTasks.filter(t => t.status === "DONE").length;
              return (
                <button key={m.id} onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border"
                  style={selectedMember?.id === m.id ? {background: getMemberColor(i), color: "white", borderColor: getMemberColor(i)} : {background: cardBg, color: textMuted, borderColor: cardBorder}}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background: getMemberColor(i)}}>
                    {m.name[0].toUpperCase()}
                  </div>
                  {m.name}
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{background: "rgba(255,255,255,0.2)", color: selectedMember?.id === m.id ? "white" : textMuted}}>
                    {mTasks.length}
                  </span>
                </button>
              );
            })}
          </div>

          {(selectedMember ? [selectedMember] : teamMembers).map((member, i) => {
            const memberTasks = getMemberTasks(member.id);
            const memberColor = getMemberColor(usersData?.users?.filter(u => u.role === "USER").findIndex(u => u.id === member.id) || i);
            const donePct = memberTasks.length ? Math.round((memberTasks.filter(t => t.status === "DONE").length / memberTasks.length) * 100) : 0;
            const overdue = memberTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length;

            return (
              <div key={member.id} className="rounded-2xl overflow-hidden" style={{border: "1px solid " + cardBorder}}>
                <div className="flex items-center gap-4 px-5 py-4" style={{background: memberColor + "15", borderBottom: "1px solid " + cardBorder}}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{background: memberColor}}>
                    {member.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold" style={{color: textMain}}>{member.name}</p>
                      {overdue > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">{overdue} overdue</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background: isDark ? "#334155" : "#e2e8f0", maxWidth: "120px"}}>
                        <div className="h-full rounded-full transition-all" style={{width: donePct + "%", background: memberColor}} />
                      </div>
                      <span className="text-xs" style={{color: textMuted}}>{donePct}% done · {memberTasks.length} tasks</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                      const count = memberTasks.filter(t => t.status === status).length;
                      if (count === 0) return null;
                      return (
                        <div key={status} className="text-center px-3 py-1.5 rounded-xl" style={{background: cardBg}}>
                          <p className="text-sm font-bold" style={{color: textMain}}>{count}</p>
                          <p className="text-xs" style={{color: textMuted}}>{cfg.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{background: cardBg}}>
                  {memberTasks.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-sm" style={{color: textMuted}}>No tasks assigned yet</p>
                    </div>
                  ) : (
                    <div className="divide-y" style={{borderColor: cardBorder}}>
                      {memberTasks.map(task => {
                        const sc = STATUS_CONFIG[task.status];
                        const pc = PRIORITY_CONFIG[task.priority];
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
                        return (
                          <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:opacity-80 transition-all cursor-pointer" onClick={() => navigate("/projects/" + task.project?.id)}>
                            <span className="text-base flex-shrink-0">{sc.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{color: textMain}}>{task.title}</p>
                              <p className="text-xs truncate" style={{color: textMuted}}>{task.project?.name}</p>
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
                            {task.dueDate && (
                              <span className="text-xs flex-shrink-0" style={{color: isOverdue ? "#ef4444" : textMuted}}>
                                {new Date(task.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short"})}
                              </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{color: textMuted}} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "board" && (
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
            const columnTasks = allTasks.filter(t => t.status === status);
            return (
              <div key={status} className="rounded-2xl overflow-hidden" style={{background: subBg, border: "1px solid " + cardBorder}}>
                <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom: "1px solid " + cardBorder}}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cfg.icon}</span>
                    <span className="text-sm font-semibold" style={{color: textMain}}>{cfg.label}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{background: BRAND + "15", color: BRAND}}>{columnTasks.length}</span>
                </div>
                <div className="p-3 space-y-2 min-h-32">
                  {columnTasks.length === 0 && (
                    <p className="text-xs text-center py-6" style={{color: textMuted}}>No tasks</p>
                  )}
                  {columnTasks.map((task, ti) => {
                    const memberIndex = teamMembers.findIndex(m => m.id === task.assigneeId);
                    const memberColor = memberIndex >= 0 ? getMemberColor(memberIndex) : "#94a3b8";
                    return (
                      <div key={task.id} className="p-3 rounded-xl cursor-pointer hover:shadow-md transition-all" style={{background: cardBg, border: "1px solid " + cardBorder}} onClick={() => navigate("/projects/" + task.project?.id)}>
                        <p className="text-xs font-medium mb-2 leading-snug" style={{color: textMain}}>{task.title}</p>
                        <p className="text-xs mb-2 truncate" style={{color: textMuted}}>{task.project?.name}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background: memberColor}}>
                              {task.assignee?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span className="text-xs" style={{color: textMuted}}>{task.assignee?.name || "Unassigned"}</span>
                          </div>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                            style={{background: task.priority === "URGENT" ? "#fee2e2" : task.priority === "HIGH" ? "#ffedd5" : task.priority === "MEDIUM" ? "#fef9c3" : "#f0fdf4",
                              color: task.priority === "URGENT" ? "#dc2626" : task.priority === "HIGH" ? "#ea580c" : task.priority === "MEDIUM" ? "#ca8a04" : "#16a34a"}}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-4">
          {teamMembers.map((member, i) => {
            const memberTasks = getMemberTasks(member.id);
            const memberColor = getMemberColor(i);
            const donePct = memberTasks.length ? Math.round((memberTasks.filter(t => t.status === "DONE").length / memberTasks.length) * 100) : 0;
            const overdue = memberTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length;
            const inProgress = memberTasks.filter(t => t.status === "IN_PROGRESS").length;
            const memberProjects = allProjects.filter(p => p.members?.some(m => m.user?.id === member.id));

            return (
              <div key={member.id} className="p-5 rounded-2xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{background: memberColor}}>
                    {member.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{color: textMain}}>{member.name}</p>
                    <p className="text-xs" style={{color: textMuted}}>{member.email}</p>
                  </div>
                  {overdue > 0 && <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-red-100 text-red-600">{overdue} overdue!</span>}
                  {inProgress > 0 && <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-blue-100 text-blue-600">{inProgress} in progress</span>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                    <div key={status} className="p-3 rounded-xl text-center" style={{background: subBg}}>
                      <p className="text-xl font-bold" style={{color: textMain}}>{memberTasks.filter(t => t.status === status).length}</p>
                      <p className="text-xs mt-0.5" style={{color: textMuted}}>{cfg.label}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{color: textMuted}}>
                    <span>Progress</span>
                    <span>{donePct}% complete · {memberProjects.length} project{memberProjects.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{background: isDark ? "#334155" : "#e2e8f0"}}>
                    <div className="h-full rounded-full transition-all duration-500" style={{width: donePct + "%", background: memberColor}} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {memberProjects.map(p => (
                    <span key={p.id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background: (p.color || BRAND) + "15", color: p.color || BRAND}}>{p.name}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "users" && isAdmin && (
        <div className="rounded-2xl p-6" style={{background: cardBg, border: "1px solid " + cardBorder}}>
          <h2 className="text-base font-semibold mb-4" style={{color: textMain}}>All Users ({usersData?.users?.length ?? 0})</h2>
          {usersLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{background: subBg}} />)}</div>
          ) : (
            <div className="space-y-2">
              {usersData?.users?.map(u => {
                const dept = DEPARTMENTS[u.department] || DEPARTMENTS.IT;
                const role = ROLES[u.role] || ROLES.USER;
                return (
                  <div key={u.id} className="flex items-center gap-3 p-4 rounded-xl" style={{border: "1px solid " + cardBorder, opacity: u.isActive ? 1 : 0.5}}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{background: BRAND}}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm" style={{color: textMain}}>{u.name}</p>
                        {!u.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Inactive</span>}
                      </div>
                      <p className="text-xs" style={{color: textMuted}}>{u.email}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full hidden sm:block" style={{background: role.color + "18", color: role.color}}>{role.label}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowEditModal(u)} className="p-1.5 rounded-lg" style={{color: textMuted}} title="Edit"><UserCog className="w-4 h-4" /></button>
                      <button onClick={() => { setShowResetModal(u); setNewPassword(""); }} className="p-1.5 rounded-lg" style={{color: textMuted}} title="Reset password"><Key className="w-4 h-4" /></button>
                      <button onClick={() => toggleActiveMutation.mutate({ id: u.id, isActive: !u.isActive })} className="p-1.5 rounded-lg" style={{color: u.isActive ? "#f59e0b" : "#10b981"}} title={u.isActive ? "Deactivate" : "Activate"}>
                        {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      {u.id !== user?.id && (
                        <button onClick={() => { if(confirm("Delete " + u.name + "?")) deleteMutation.mutate(u.id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: "rgba(0,0,0,0.5)"}}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{color: textMain}}>Create New User</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl" style={{color: textMuted}}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label" style={{color: textMuted}}>Full Name *</label>
                <input value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} placeholder="e.g. Rahul Kumar" className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
              </div>
              <div>
                <label className="label" style={{color: textMuted}}>Email *</label>
                <input value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} type="email" placeholder="rahul@flamingopharma.com" className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
              </div>
              <div>
                <label className="label" style={{color: textMuted}}>Password *</label>
                <div className="relative">
                  <input value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} type={showPassword ? "text" : "password"} placeholder="Min 8 characters" className="input pr-10" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{color: textMuted}}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label" style={{color: textMuted}}>Role</label>
                <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                  {Object.entries(ROLES).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={() => createMutation.mutate(createForm)} disabled={createMutation.isPending || !createForm.name || !createForm.email || !createForm.password} className="flex-1 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center" style={{background: BRAND, opacity: !createForm.name || !createForm.email || !createForm.password ? 0.5 : 1}}>
                  {createMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: "rgba(0,0,0,0.5)"}}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{color: textMain}}>Reset Password</h2>
              <button onClick={() => setShowResetModal(null)} style={{color: textMuted}}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm mb-4" style={{color: textMuted}}>For <strong style={{color: textMain}}>{showResetModal.name}</strong></p>
            <div className="relative">
              <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="New password" className="input pr-10" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{color: textMuted}}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowResetModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => resetPasswordMutation.mutate({ id: showResetModal.id, newPassword })} disabled={newPassword.length < 8} className="flex-1 py-2 rounded-xl text-white font-medium flex items-center justify-center" style={{background: BRAND, opacity: newPassword.length < 8 ? 0.5 : 1}}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: "rgba(0,0,0,0.5)"}}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{color: textMain}}>Edit User</h2>
              <button onClick={() => setShowEditModal(null)} style={{color: textMuted}}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label" style={{color: textMuted}}>Name</label>
                <input value={showEditModal.name} onChange={e => setShowEditModal({...showEditModal, name: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
              </div>
              <div>
                <label className="label" style={{color: textMuted}}>Role</label>
                <select value={showEditModal.role} onChange={e => setShowEditModal({...showEditModal, role: e.target.value})} className="input" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                  {Object.entries(ROLES).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEditModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={() => updateMutation.mutate({ id: showEditModal.id, name: showEditModal.name, role: showEditModal.role })} className="flex-1 py-2 rounded-xl text-white font-medium flex items-center justify-center" style={{background: BRAND}}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}