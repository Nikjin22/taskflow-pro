import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import api from "../lib/api";
import { CheckSquare, FolderKanban, AlertTriangle, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { STATUS_CONFIG } from "../lib/constants";

const BRAND = "#6366f1";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();

  const cardBg = isDark ? "#1e293b" : "white";
  const cardBorder = isDark ? "#334155" : "#e2e8f0";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const subBg = isDark ? "#0f172a" : "#f8fafc";

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/tasks/dashboard").then(r => r.data),
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const statusMap = {};
  data?.stats?.tasksByStatus?.forEach(({ status, _count }) => {
    statusMap[status] = _count.status;
  });

  const totalDone = statusMap["DONE"] || 0;
  const total = data?.stats?.totalTasks || 1;
  const completionRate = Math.round((totalDone / total) * 100);

  const statCards = [
    { icon: FolderKanban, label: "Projects", value: data?.stats?.totalProjects ?? 0 },
    { icon: CheckSquare, label: "Total Tasks", value: data?.stats?.totalTasks ?? 0 },
    { icon: AlertTriangle, label: "Overdue", value: data?.stats?.overdueTasks ?? 0 },
    { icon: TrendingUp, label: "Completion", value: (data ? completionRate : 0) + "%" },
  ];

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-10 rounded-xl w-72 animate-pulse" style={{background: cardBg}} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{background: cardBg}} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="font-semibold mb-2" style={{color: textMain}}>Session expired</p>
      <p className="text-sm mb-6" style={{color: textMuted}}>Please log in again to continue.</p>
      <Link to="/login" className="btn-primary">Go to Login</Link>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{color: textMain}}>{greeting()}, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="mt-1" style={{color: textMuted}}>Here is your Workspace overview for today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({icon: Icon, label, value}) => (
          <div key={label} className="p-6 rounded-2xl" style={{background: cardBg, border: "1px solid " + cardBorder}}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{color: textMuted}}>{label}</p>
                <p className="text-3xl font-bold mt-1" style={{color: textMain}}>{value}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{background: "rgba(232,56,45,0.1)"}}>
                <Icon className="w-5 h-5" style={{color: BRAND}} strokeWidth={2} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={{background: cardBg, border: "1px solid " + cardBorder}}>
        <h2 className="text-base font-semibold mb-4" style={{color: textMain}}>Task Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
            <div key={status} className="flex items-center gap-3 p-3 rounded-xl" style={{background: subBg}}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{background: isDark ? "#334155" : "#f1f5f9"}}>
                {cfg.icon}
              </div>
              <div>
                <p className="text-xl font-bold" style={{color: textMain}}>{statusMap[status] || 0}</p>
                <p className="text-xs" style={{color: textMuted}}>{cfg.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5" style={{color: textMuted}}>
            <span>Overall progress</span>
            <span>{completionRate}% complete</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{background: isDark ? "#334155" : "#e2e8f0"}}>
            <div className="h-full rounded-full transition-all duration-1000" style={{width: completionRate + "%", background: BRAND}} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={{background: cardBg, border: "1px solid " + cardBorder}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2" style={{color: textMain}}>
              <AlertTriangle className="w-4 h-4" style={{color: BRAND}} /> Overdue Tasks
            </h2>
            <Link to="/tasks" className="text-xs font-medium flex items-center gap-1" style={{color: BRAND}}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!data?.overdueTasks?.length ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm" style={{color: textMuted}}>No overdue tasks!</p>
            </div>
          ) : data.overdueTasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center gap-3 py-3" style={{borderBottom: "1px solid " + cardBorder}}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background: BRAND}} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{color: textMain}}>{task.title}</p>
                <p className="text-xs" style={{color: textMuted}}>{task.project?.name} · {task.assignee?.name || "Unassigned"}</p>
              </div>
              <span className="text-xs text-red-500 flex-shrink-0">{new Date(task.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short"})}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6" style={{background: cardBg, border: "1px solid " + cardBorder}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2" style={{color: textMain}}>
              <Calendar className="w-4 h-4" style={{color: BRAND}} /> Due This Week
            </h2>
            <Link to="/tasks" className="text-xs font-medium flex items-center gap-1" style={{color: BRAND}}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!data?.upcomingTasks?.length ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm" style={{color: textMuted}}>Nothing due this week!</p>
            </div>
          ) : data.upcomingTasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center gap-3 py-3" style={{borderBottom: "1px solid " + cardBorder}}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background: "#10b981"}} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{color: textMain}}>{task.title}</p>
                <p className="text-xs" style={{color: textMuted}}>{task.project?.name} · {task.assignee?.name || "Unassigned"}</p>
              </div>
              <span className="text-xs flex-shrink-0" style={{color: textMuted}}>{new Date(task.dueDate).toLocaleDateString("en-IN", {day:"numeric", month:"short"})}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}