import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";
import { CheckSquare, FolderKanban, AlertTriangle, TrendingUp, Calendar, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { STATUS_CONFIG } from "../lib/constants";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/tasks/dashboard").then(r => r.data),
    retry: false,
    staleTime: 0,
    refetchInterval: 10000,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const statusMap = {};
  data?.stats?.tasksByStatus?.forEach(({ status, _count }) => { statusMap[status] = _count.status; });
  const totalDone = statusMap["DONE"] || 0;
  const total = data?.stats?.totalTasks || 1;
  const completionRate = Math.round((totalDone / total) * 100);

  const statCards = [
    { icon: FolderKanban, label: "Active Projects", value: data?.stats?.totalProjects ?? 0, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { icon: CheckSquare, label: "Total Tasks", value: data?.stats?.totalTasks ?? 0, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    { icon: AlertTriangle, label: "Overdue", value: data?.stats?.overdueTasks ?? 0, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    { icon: TrendingUp, label: "Completion Rate", value: (data ? completionRate : 0) + "%", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  ];

  const statusDisplay = [
    { key: "TODO", label: "To Do", color: "rgba(255,255,255,0.3)" },
    { key: "IN_PROGRESS", label: "In Progress", color: "#6366f1" },
    { key: "IN_REVIEW", label: "In Review", color: "#8b5cf6" },
    { key: "DONE", label: "Done", color: "#10b981" },
  ];

  if (isLoading) return (
    <div style={{display: "flex", flexDirection: "column", gap: "24px"}}>
      <div style={{height: "32px", width: "250px", borderRadius: "8px"}} className="skeleton" />
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px"}}>
        {[...Array(4)].map((_, i) => <div key={i} style={{height: "120px", borderRadius: "16px"}} className="skeleton" />)}
      </div>
    </div>
  );

  if (error) return (
    <div style={{textAlign: "center", padding: "80px 20px"}}>
      <p style={{color: "rgba(255,255,255,0.3)", fontSize: "14px"}}>Session expired. <Link to="/login" style={{color: "#6366f1"}}>Sign in again</Link></p>
    </div>
  );

  return (
    <div style={{display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease"}}>
      <div>
        <h1 style={{fontSize: "24px", fontWeight: "700", color: "white", margin: "0 0 4px", letterSpacing: "-0.5px"}}>{greeting()}, {user?.name?.split(" ")[0]}! 👋</h1>
        <p style={{fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0}}>Here is your workspace overview for today.</p>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px"}} className="lg:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} style={{padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s"}}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px"}}>
              <div style={{width: "38px", height: "38px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center"}}>
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
            </div>
            <p style={{fontSize: "28px", fontWeight: "700", color: "white", margin: "0 0 4px", letterSpacing: "-0.5px"}}>{value}</p>
            <p style={{fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: "500"}}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"}}>
          <h2 style={{fontSize: "14px", fontWeight: "600", color: "white", margin: 0}}>Task Overview</h2>
          <span style={{fontSize: "12px", color: "rgba(255,255,255,0.4)"}}>{completionRate}% complete</span>
        </div>
        <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px"}}>
          {statusDisplay.map(({ key, label, color }) => (
            <div key={key} style={{padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)"}}>
              <p style={{fontSize: "22px", fontWeight: "700", color: "white", margin: "0 0 4px"}}>{statusMap[key] || 0}</p>
              <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <div style={{width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0}} />
                <p style={{fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: "500"}}>{label}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden"}}>
          <div style={{height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #6366f1, #8b5cf6, #10b981)", width: completionRate + "%", transition: "width 1s ease"}} />
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
        <div style={{padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"}}>
            <h2 style={{fontSize: "14px", fontWeight: "600", color: "white", margin: 0, display: "flex", alignItems: "center", gap: "8px"}}>
              <AlertTriangle size={14} color="#ef4444" /> Overdue Tasks
            </h2>
            <Link to="/tasks" style={{fontSize: "12px", color: "#6366f1", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", fontWeight: "500"}}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {!data?.overdueTasks?.length ? (
            <div style={{textAlign: "center", padding: "24px 0"}}>
              <p style={{fontSize: "24px", margin: "0 0 8px"}}>🎉</p>
              <p style={{fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: 0}}>No overdue tasks!</p>
            </div>
          ) : data.overdueTasks.slice(0, 4).map(task => (
            <div key={task.id} style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"}}>
              <div style={{width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", flexShrink: 0}} />
              <div style={{flex: 1, minWidth: 0}}>
                <p style={{fontSize: "13px", color: "white", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "500"}}>{task.title}</p>
                <p style={{fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0}}>{task.project?.name} · {task.assignee?.name || "Unassigned"}</p>
              </div>
              <span style={{fontSize: "11px", color: "#ef4444", flexShrink: 0, fontWeight: "500"}}>{new Date(task.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short"})}</span>
            </div>
          ))}
        </div>

        <div style={{padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"}}>
            <h2 style={{fontSize: "14px", fontWeight: "600", color: "white", margin: 0, display: "flex", alignItems: "center", gap: "8px"}}>
              <Calendar size={14} color="#6366f1" /> Due This Week
            </h2>
            <Link to="/tasks" style={{fontSize: "12px", color: "#6366f1", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", fontWeight: "500"}}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {!data?.upcomingTasks?.length ? (
            <div style={{textAlign: "center", padding: "24px 0"}}>
              <p style={{fontSize: "24px", margin: "0 0 8px"}}>✨</p>
              <p style={{fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: 0}}>Nothing due this week!</p>
            </div>
          ) : data.upcomingTasks.slice(0, 4).map(task => (
            <div key={task.id} style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"}}>
              <div style={{width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", flexShrink: 0}} />
              <div style={{flex: 1, minWidth: 0}}>
                <p style={{fontSize: "13px", color: "white", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "500"}}>{task.title}</p>
                <p style={{fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0}}>{task.project?.name} · {task.assignee?.name || "Unassigned"}</p>
              </div>
              <span style={{fontSize: "11px", color: "rgba(255,255,255,0.4)", flexShrink: 0}}>{new Date(task.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short"})}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}