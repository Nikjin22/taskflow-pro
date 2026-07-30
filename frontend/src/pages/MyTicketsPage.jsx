import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import api from "../lib/api";
import toast from "react-hot-toast";
import { Ticket, ExternalLink, Send, CheckCircle } from "lucide-react";

const BRAND = "#6366f1";

const STATUS_COLORS = {
  OPEN: { bg: "#fee2e2", color: "#dc2626", label: "Open", icon: "🔴" },
  IN_PROGRESS: { bg: "#dbeafe", color: "#1d4ed8", label: "In Progress", icon: "🔵" },
  RESOLVED: { bg: "#dcfce7", color: "#16a34a", label: "Resolved", icon: "🟢" },
  CLOSED: { bg: "#f1f5f9", color: "#64748b", label: "Closed", icon: "⚫" },
};

const PRIORITY_COLORS = {
  LOW: { bg: "#f0fdf4", color: "#16a34a", label: "Low" },
  MEDIUM: { bg: "#fef9c3", color: "#ca8a04", label: "Medium" },
  HIGH: { bg: "#ffedd5", color: "#ea580c", label: "High" },
  URGENT: { bg: "#fee2e2", color: "#dc2626", label: "Urgent" },
};

export default function MyTicketsPage() {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [note, setNote] = useState("");
  const [showResolution, setShowResolution] = useState(false);
  const [resolution, setResolution] = useState("");

  const cardBg = isDark ? "#1e293b" : "white";
  const cardBorder = isDark ? "#334155" : "#e2e8f0";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "white";
  const subBg = isDark ? "#0f172a" : "#f8fafc";

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my-assigned-tickets"] });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["my-assigned-tickets"],
    queryFn: () => api.get("/tickets/assigned/me").then(r => r.data),
    refetchInterval: 10000,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch("/tickets/" + id, data),
    onSuccess: (res) => {
      invalidate();
      setSelectedTicket(res.data.ticket);
      toast.success("Ticket updated!");
    },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const noteMutation = useMutation({
    mutationFn: ({ ticketId, content }) => api.post("/tickets/" + ticketId + "/notes", { content, isInternal: false }),
    onSuccess: (res) => {
      invalidate();
      setSelectedTicket(prev => ({ ...prev, notes: [...(prev?.notes || []), res.data.note] }));
      setNote("");
      toast.success("Update added!");
    },
    onError: err => toast.error(err.response?.data?.error || "Failed"),
  });

  const tickets = data?.tickets || [];
  const activeTickets = tickets.filter(t => t.status !== "CLOSED" && t.status !== "RESOLVED");
  const resolvedTickets = tickets.filter(t => t.status === "CLOSED" || t.status === "RESOLVED");

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{background: BRAND}}>
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color: textMain}}>My Tickets</h1>
            <p className="text-sm" style={{color: textMuted}}>Helpdesk tickets assigned to you · Live updates every 10s</p>
          </div>
        </div>
        <a href="/helpdesk" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
          style={{borderColor: BRAND, color: BRAND, background: BRAND + "10"}}>
          <ExternalLink className="w-4 h-4" /> Helpdesk Form
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Assigned", value: tickets.length },
          { label: "Active", value: activeTickets.length },
          { label: "Resolved", value: resolvedTickets.length },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 rounded-2xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
            <p className="text-sm" style={{color: textMuted}}>{label}</p>
            <p className="text-3xl font-bold mt-1" style={{color: BRAND}}>{value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl animate-pulse" style={{background: cardBg}} />)}</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-medium" style={{color: textMain}}>No tickets assigned to you</p>
          <p className="text-sm mt-1" style={{color: textMuted}}>When manager assigns a ticket to you, it will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const sc = STATUS_COLORS[ticket.status];
            const pc = PRIORITY_COLORS[ticket.priority];
            const isSelected = selectedTicket?.id === ticket.id;
            return (
              <div key={ticket.id} className="rounded-2xl overflow-hidden transition-all"
                style={{background: cardBg, border: "2px solid " + (isSelected ? BRAND : cardBorder)}}>
                <div className="flex items-start gap-3 p-5 cursor-pointer" onClick={() => setSelectedTicket(isSelected ? null : ticket)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold" style={{color: BRAND}}>{ticket.ticketNumber}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background: sc.bg, color: sc.color}}>{sc.icon} {sc.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background: pc.bg, color: pc.color}}>{pc.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{background: subBg, color: textMuted}}>{ticket.category}</span>
                    </div>
                    <p className="font-semibold" style={{color: textMain}}>{ticket.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs" style={{color: textMuted}}>👤 {ticket.name}</span>
                      <span className="text-xs" style={{color: textMuted}}>🏢 {ticket.department}</span>
                      <span className="text-xs" style={{color: textMuted}}>📧 {ticket.email}</span>
                      <span className="text-xs" style={{color: textMuted}}>🕐 {new Date(ticket.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}</span>
                    </div>
                  </div>
                  <span className="text-xs" style={{color: textMuted}}>{isSelected ? "▲ Hide" : "▼ Show"}</span>
                </div>

                {isSelected && (
                  <div className="px-5 pb-5 space-y-4" style={{borderTop: "1px solid " + cardBorder}}>
                    <div className="pt-4">
                      <p className="text-xs font-semibold mb-2" style={{color: textMuted}}>ISSUE DESCRIPTION</p>
                      <div className="p-4 rounded-xl text-sm leading-relaxed" style={{background: subBg, color: textMain}}>
                        {ticket.description}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold mb-2" style={{color: textMuted}}>UPDATE STATUS</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(STATUS_COLORS).map(([status, cfg]) => (
                          <button key={status} onClick={() => updateMutation.mutate({ id: ticket.id, status })}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                            style={ticket.status === status
                              ? {background: cfg.color, color: "white", borderColor: cfg.color}
                              : {background: cfg.bg, color: cfg.color, borderColor: cfg.color + "50"}}>
                            {cfg.icon} {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!showResolution && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                      <button onClick={() => setShowResolution(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0"}}>
                        <CheckCircle className="w-4 h-4" /> Mark as Resolved
                      </button>
                    )}

                    {showResolution && (
                      <div className="p-4 rounded-xl space-y-3" style={{background: "#dcfce715", border: "1px solid #16a34a30"}}>
                        <p className="text-xs font-semibold text-green-600">✅ Resolution Details</p>
                        <textarea value={resolution} onChange={e => setResolution(e.target.value)}
                          rows={3} placeholder="Describe how you resolved this issue..."
                          className="textarea w-full text-sm" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                        <div className="flex gap-2">
                          <button onClick={() => setShowResolution(false)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                          <button onClick={() => {
                            updateMutation.mutate({ id: ticket.id, status: "RESOLVED", resolution });
                            setShowResolution(false);
                            setResolution("");
                          }} className="flex-1 py-2 rounded-xl text-white text-sm font-medium" style={{background: "#16a34a"}}>
                            Save & Resolve
                          </button>
                        </div>
                      </div>
                    )}

                    {ticket.resolution && (
                      <div className="p-4 rounded-xl" style={{background: "#dcfce7", border: "1px solid #bbf7d0"}}>
                        <p className="text-xs font-semibold text-green-700 mb-2">✅ Resolution</p>
                        <p className="text-sm text-green-800">{ticket.resolution}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold mb-3" style={{color: textMuted}}>ACTIVITY & NOTES ({ticket.notes?.length || 0})</p>
                      <div className="space-y-2 mb-3">
                        {ticket.notes?.map(n => (
                          <div key={n.id} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background: BRAND}}>
                              {n.author.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold mb-1" style={{color: textMain}}>
                                {n.author.name} <span style={{color: textMuted, fontWeight: 400}}>· {new Date(n.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}</span>
                              </p>
                              <div className="p-3 rounded-xl text-sm" style={{background: subBg, color: textMain}}>{n.content}</div>
                            </div>
                          </div>
                        ))}
                        {(!ticket.notes || ticket.notes.length === 0) && (
                          <p className="text-sm text-center py-3" style={{color: textMuted}}>No updates yet. Add one below.</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1" style={{background: BRAND}}>
                          {user?.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input value={note} onChange={e => setNote(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && note.trim()) noteMutation.mutate({ ticketId: ticket.id, content: note }); }}
                            placeholder="Add an update or note... (Enter to send)"
                            className="input flex-1 text-sm" style={{background: inputBg, color: textMain, borderColor: cardBorder}} />
                          <button onClick={() => note.trim() && noteMutation.mutate({ ticketId: ticket.id, content: note })}
                            disabled={!note.trim() || noteMutation.isPending}
                            className="p-2.5 rounded-xl text-white flex-shrink-0"
                            style={{background: BRAND, opacity: !note.trim() ? 0.5 : 1}}>
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}