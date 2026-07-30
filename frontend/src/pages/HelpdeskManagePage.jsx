import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Ticket, X, Send, Clock, CheckCircle, AlertCircle, User, Filter, ExternalLink } from "lucide-react";

const BRAND = "#6366f1";

const STATUS_CONFIG = {
  OPEN: { label: "Open", bg: "#fee2e2", color: "#dc2626", icon: "🔴" },
  IN_PROGRESS: { label: "In Progress", bg: "#dbeafe", color: "#1d4ed8", icon: "🔵" },
  RESOLVED: { label: "Resolved", bg: "#dcfce7", color: "#16a34a", icon: "🟢" },
  CLOSED: { label: "Closed", bg: "#f1f5f9", color: "#64748b", icon: "⚫" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Low", bg: "#f0fdf4", color: "#16a34a" },
  MEDIUM: { label: "Medium", bg: "#fef9c3", color: "#ca8a04" },
  HIGH: { label: "High", bg: "#ffedd5", color: "#ea580c" },
  URGENT: { label: "Urgent", bg: "#fee2e2", color: "#dc2626" },
};

export default function HelpdeskManagePage() {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const queryClient = useQueryClient();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [note, setNote] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [resolution, setResolution] = useState("");
  const [showResolution, setShowResolution] = useState(false);

  const cardBg = isDark ? "#1e293b" : "white";
  const cardBorder = isDark ? "#334155" : "#e2e8f0";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "white";
  const subBg = isDark ? "#0f172a" : "#f8fafc";

  const { data, isLoading } = useQuery({
    queryKey: ["helpdesk-tickets", filterStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      return api.get("/tickets?" + params.toString()).then(r => r.data);
    },
    refetchInterval: 10000,
    retry: false,
  });

  const { data: usersData } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => api.get("/admin/users").then(r => r.data),
  });

  const itTeam = (usersData?.users || []).filter(u => u.isActive);

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch("/tickets/" + id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
      setSelectedTicket(res.data.ticket);
      toast.success("Ticket updated!");
    },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const noteMutation = useMutation({
    mutationFn: ({ ticketId, content, isInternal }) => api.post("/tickets/" + ticketId + "/notes", { content, isInternal }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
      setSelectedTicket(prev => ({ ...prev, notes: [...(prev?.notes || []), res.data.note] }));
      setNote("");
      toast.success(isInternal ? "Internal note added" : "Reply sent to user!");
    },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete("/tickets/" + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
      setSelectedTicket(null);
      toast.success("Ticket deleted");
    },
  });

  const tickets = data?.tickets || [];
  const stats = data?.stats || {};

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{background: BRAND}}>
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color: textMain}}>IT Helpdesk</h1>
            <p className="text-sm" style={{color: textMuted}}>Manage support tickets · Updates every 10s</p>
          </div>
        </div>
        <a href="/helpdesk" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
          style={{borderColor: BRAND, color: BRAND, background: BRAND + "10"}}>
          <ExternalLink className="w-4 h-4" /> Open Helpdesk Form
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total || 0, status: "" },
          { label: "Open", value: stats.open || 0, status: "OPEN" },
          { label: "In Progress", value: stats.inProgress || 0, status: "IN_PROGRESS" },
          { label: "Resolved", value: stats.resolved || 0, status: "RESOLVED" },
        ].map(({ label, value, status }) => (
          <button key={label} onClick={() => setFilterStatus(filterStatus === status ? "" : status)}
            className="p-4 rounded-2xl text-left transition-all"
            style={{background: filterStatus === status ? BRAND : cardBg, border: "1px solid " + (filterStatus === status ? BRAND : cardBorder)}}>
            <p className="text-sm" style={{color: filterStatus === status ? "rgba(255,255,255,0.8)" : textMuted}}>{label}</p>
            <p className="text-3xl font-bold mt-1" style={{color: filterStatus === status ? "white" : BRAND}}>{value}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{border: "1px solid " + cardBorder}}>
        <div className="px-5 py-3 flex items-center justify-between" style={{background: cardBg, borderBottom: "1px solid " + cardBorder}}>
          <p className="font-semibold text-sm" style={{color: textMain}}>
            {filterStatus ? STATUS_CONFIG[filterStatus]?.label : "All"} Tickets ({tickets.length})
          </p>
          {filterStatus && (
            <button onClick={() => setFilterStatus("")} className="text-xs flex items-center gap-1" style={{color: BRAND}}>
              <X className="w-3 h-3" /> Clear filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{background: subBg}} />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16" style={{background: cardBg}}>
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-medium" style={{color: textMain}}>No tickets!</p>
            <p className="text-sm mt-1" style={{color: textMuted}}>All clear — no pending support requests</p>
          </div>
        ) : (
          <div style={{background: cardBg}}>
            {tickets.map(ticket => {
              const sc = STATUS_CONFIG[ticket.status];
              const pc = PRIORITY_CONFIG[ticket.priority];
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-all"
                  style={{borderBottom: "1px solid " + cardBorder, background: isSelected ? BRAND + "08" : "transparent",
                    borderLeft: isSelected ? "3px solid " + BRAND : "3px solid transparent"}}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold" style={{color: BRAND}}>{ticket.ticketNumber}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background: sc.bg, color: sc.color}}>{sc.icon} {sc.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background: pc.bg, color: pc.color}}>{pc.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{background: subBg, color: textMuted}}>{ticket.category}</span>
                    </div>
                    <p className="font-medium text-sm truncate" style={{color: textMain}}>{ticket.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs" style={{color: textMuted}}>👤 {ticket.name}</span>
                      <span className="text-xs" style={{color: textMuted}}>🏢 {ticket.department}</span>
                      <span className="text-xs" style={{color: textMuted}}>🕐 {new Date(ticket.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}</span>
                      {ticket.assignee && <span className="text-xs" style={{color: textMuted}}>→ {ticket.assignee.name}</span>}
                      {ticket._count?.notes > 0 && <span className="text-xs" style={{color: textMuted}}>💬 {ticket._count.notes}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" style={{background: "rgba(0,0,0,0.4)"}}>
          <div className="h-full w-full max-w-2xl flex flex-col" style={{background: cardBg, borderLeft: "1px solid " + cardBorder}}>
            <div className="flex items-center gap-3 p-5 flex-shrink-0" style={{borderBottom: "1px solid " + cardBorder}}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{color: BRAND}}>{selectedTicket.ticketNumber}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background: STATUS_CONFIG[selectedTicket.status]?.bg, color: STATUS_CONFIG[selectedTicket.status]?.color}}>
                    {STATUS_CONFIG[selectedTicket.status]?.label}
                  </span>
                </div>
                <h2 className="font-bold text-base" style={{color: textMain}}>{selectedTicket.title}</h2>
              </div>
              <div className="flex items-center gap-1">
                {["ADMIN", "MANAGER"].includes(user?.role) && (
                  <button onClick={() => { if(confirm("Delete this ticket?")) deleteMutation.mutate(selectedTicket.id); }}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50">
                    🗑️
                  </button>
                )}
                <button onClick={() => { setSelectedTicket(null); setNote(""); setShowResolution(false); }}
                  className="p-2 rounded-lg" style={{color: textMuted}}><X className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{background: subBg}}>
                  <p className="text-xs font-medium mb-1" style={{color: textMuted}}>Submitted By</p>
                  <p className="text-sm font-semibold" style={{color: textMain}}>{selectedTicket.name}</p>
                  <p className="text-xs" style={{color: textMuted}}>{selectedTicket.email}</p>
                </div>
                <div className="p-3 rounded-xl" style={{background: subBg}}>
                  <p className="text-xs font-medium mb-1" style={{color: textMuted}}>Department</p>
                  <p className="text-sm font-semibold" style={{color: textMain}}>{selectedTicket.department}</p>
                  <p className="text-xs" style={{color: textMuted}}>{selectedTicket.category}</p>
                </div>
                <div className="p-3 rounded-xl" style={{background: subBg}}>
                  <p className="text-xs font-medium mb-2" style={{color: textMuted}}>Status</p>
                  <select value={selectedTicket.status}
                    onChange={e => updateMutation.mutate({ id: selectedTicket.id, status: e.target.value })}
                    className="input text-sm py-1.5" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                    {Object.entries(STATUS_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div className="p-3 rounded-xl" style={{background: subBg}}>
                  <p className="text-xs font-medium mb-2" style={{color: textMuted}}>Priority</p>
                  <select value={selectedTicket.priority}
                    onChange={e => updateMutation.mutate({ id: selectedTicket.id, priority: e.target.value })}
                    className="input text-sm py-1.5" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                    {Object.entries(PRIORITY_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div className="p-3 rounded-xl col-span-2" style={{background: subBg}}>
                  <p className="text-xs font-medium mb-2" style={{color: textMuted}}>Assign To</p>
                  <select value={selectedTicket.assigneeId || ""}
                    onChange={e => updateMutation.mutate({ id: selectedTicket.id, assigneeId: e.target.value || null })}
                    className="input text-sm py-1.5" style={{background: inputBg, color: textMain, borderColor: cardBorder}}>
                    <option value="">Unassigned — pick up this ticket</option>
                    {itTeam.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold mb-2" style={{color: textMuted}}>ISSUE DESCRIPTION</p>
                <div className="p-4 rounded-xl text-sm leading-relaxed" style={{background: subBg, color: textMain}}>
                  {selectedTicket.description}
                </div>
              </div>

              {selectedTicket.resolution && (
                <div className="p-4 rounded-xl" style={{background: "#dcfce7", border: "1px solid #bbf7d0"}}>
                  <p className="text-xs font-semibold text-green-700 mb-2">✅ RESOLUTION</p>
                  <p className="text-sm text-green-800">{selectedTicket.resolution}</p>
                </div>
              )}

              {showResolution && (
                <div className="p-4 rounded-xl space-y-3" style={{background: subBg, border: "1px solid " + cardBorder}}>
                  <p className="text-xs font-semibold" style={{color: BRAND}}>✅ Add Resolution</p>
                  <textarea value={resolution} onChange={e => setResolution(e.target.value)}
                    rows={3} placeholder="Describe how this issue was resolved..."
                    className="textarea w-full text-sm" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                  <div className="flex gap-2">
                    <button onClick={() => setShowResolution(false)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                    <button onClick={() => { updateMutation.mutate({ id: selectedTicket.id, resolution, status: "RESOLVED" }); setShowResolution(false); setResolution(""); }}
                      className="flex-1 py-2 rounded-xl text-white text-sm font-medium" style={{background: "#16a34a"}}>
                      Save Resolution
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {!showResolution && (
                  <button onClick={() => setShowResolution(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2"
                    style={{borderColor: "#16a34a", color: "#16a34a", background: "#dcfce7"}}>
                    ✅ Add Resolution
                  </button>
                )}
                <button onClick={() => updateMutation.mutate({ id: selectedTicket.id, status: "CLOSED" })}
                  className="px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2"
                  style={{borderColor: cardBorder, color: textMuted, background: subBg}}>
                  ⚫ Close Ticket
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold mb-3" style={{color: textMuted}}>
                  ACTIVITY & NOTES ({selectedTicket.notes?.length || 0})
                </p>
                <div className="space-y-3 mb-4">
                  {selectedTicket.notes?.length === 0 && (
                    <p className="text-sm text-center py-4" style={{color: textMuted}}>No notes yet. Add a reply or internal note below.</p>
                  )}
                  {selectedTicket.notes?.map(n => (
                    <div key={n.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{background: n.isInternal ? "#8b5cf6" : BRAND}}>
                        {n.author.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold" style={{color: textMain}}>{n.author.name}</span>
                          {n.isInternal && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">Internal Note</span>
                          )}
                          <span className="text-xs" style={{color: textMuted}}>
                            {new Date(n.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl text-sm" style={{background: n.isInternal ? "#f3e8ff" : subBg, color: textMain}}>
                          {n.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button onClick={() => setIsInternal(false)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all"
                      style={!isInternal ? {background: BRAND, color: "white", borderColor: BRAND} : {background: subBg, color: textMuted, borderColor: cardBorder}}>
                      📤 Reply to User
                    </button>
                    <button onClick={() => setIsInternal(true)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all"
                      style={isInternal ? {background: "#8b5cf6", color: "white", borderColor: "#8b5cf6"} : {background: subBg, color: textMuted, borderColor: cardBorder}}>
                      🔒 Internal Note
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input value={note} onChange={e => setNote(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && note.trim()) noteMutation.mutate({ ticketId: selectedTicket.id, content: note, isInternal }); }}
                      placeholder={isInternal ? "Internal note (not visible to user)..." : "Reply visible to user..."}
                      className="input flex-1 text-sm" style={{background: inputBg, color: textMain, borderColor: isInternal ? "#8b5cf6" : cardBorder}} />
                    <button onClick={() => note.trim() && noteMutation.mutate({ ticketId: selectedTicket.id, content: note, isInternal })}
                      disabled={!note.trim() || noteMutation.isPending}
                      className="p-2.5 rounded-xl text-white flex-shrink-0"
                      style={{background: isInternal ? "#8b5cf6" : BRAND, opacity: !note.trim() ? 0.5 : 1}}>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs" style={{color: textMuted}}>
                    {isInternal ? "🔒 Internal notes are only visible to IT team" : "📤 This reply will be visible to the user when they track their ticket"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}