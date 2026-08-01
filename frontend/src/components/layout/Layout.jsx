import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, LogOut, Menu, X, Shield, Sun, Moon, Ticket, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAdminOrManager = ["ADMIN", "MANAGER"].includes(user?.role);
  const isUser = user?.role === "USER";

  const { data: ticketsData } = useQuery({
    queryKey: ["my-assigned-tickets"],
    queryFn: () => api.get("/tickets/assigned/me").then(r => r.data),
    enabled: isUser,
    refetchInterval: 15000,
    retry: false,
  });

  const assignedTicketsCount = ticketsData?.tickets?.filter(t => t.status !== "CLOSED" && t.status !== "RESOLVED").length || 0;

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", show: true },
    { to: "/projects", icon: FolderKanban, label: "Projects", show: true },
    { to: "/tasks", icon: CheckSquare, label: "My Tasks", show: true },
    { to: "/my-tickets", icon: Ticket, label: "My Tickets", show: isUser, badge: assignedTicketsCount },
    { to: "/helpdesk-manage", icon: Ticket, label: "Helpdesk", show: isAdminOrManager },
    { to: "/admin", icon: Shield, label: user?.role === "ADMIN" ? "Admin Panel" : "Manage", show: isAdminOrManager },
    { to: "/settings", icon: Settings, label: "Settings", show: true },
  ].filter(n => n.show);

  const roleLabel = { ADMIN: "Administrator", MANAGER: "IT Manager", USER: "Team Member" };
  const roleColor = { ADMIN: "#f59e0b", MANAGER: "#6366f1", USER: "#10b981" };

  const sidebarContent = (
    <div style={{display: "flex", flexDirection: "column", height: "100%", background: "rgba(10,10,15,0.98)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.06)"}}>
      <div style={{padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
          <div style={{width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "14px", color: "white", boxShadow: "0 4px 12px rgba(99,102,241,0.3)", flexShrink: 0}}>T</div>
          <div>
            <p style={{fontWeight: "700", fontSize: "14px", color: "white", margin: 0, letterSpacing: "-0.2px"}}>TaskFlow Pro</p>
            <p style={{fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0}}>Workspace</p>
          </div>
          <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)} style={{background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px"}}>
            <X size={16} />
          </button>
        </div>
      </div>

      <nav style={{flex: 1, padding: "12px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px"}}>
        <p style={{fontSize: "10px", fontWeight: "600", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "1px", padding: "8px 8px 4px", margin: 0}}>Navigation</p>
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
          return (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              style={{display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "500", textDecoration: "none", transition: "all 0.15s ease", position: "relative",
                background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                color: isActive ? "#818cf8" : "rgba(255,255,255,0.5)",
                border: isActive ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent"}}>
              <Icon size={15} strokeWidth={isActive ? 2.5 : 2} style={{flexShrink: 0}} />
              <span style={{flex: 1}}>{label}</span>
              {badge > 0 && (
                <span style={{padding: "2px 7px", borderRadius: "999px", background: "#ef4444", color: "white", fontSize: "10px", fontWeight: "700", minWidth: "18px", textAlign: "center"}}>{badge}</span>
              )}
              {isActive && <ChevronRight size={12} style={{opacity: 0.5}} />}
            </NavLink>
          );
        })}
      </nav>

      <div style={{padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)"}}>
        <div style={{padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "10px", cursor: "default", position: "relative"}}
          className="group">
          <div style={{width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", color: "white", flexShrink: 0}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <p style={{fontSize: "13px", fontWeight: "600", color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{user?.name}</p>
            <p style={{fontSize: "11px", margin: 0, fontWeight: "500", color: roleColor[user?.role] || "#10b981"}}>{roleLabel[user?.role] || "Team Member"}</p>
          </div>
          <button onClick={logout} title="Sign out"
            style={{background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center", transition: "all 0.15s"}}
            onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "none"; }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{display: "flex", height: "100vh", overflow: "hidden", background: "#0a0a0f", backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 50%)"}}>
      {sidebarOpen && <div style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 20, backdropFilter: "blur(4px)"}} className="lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside style={{width: "220px", flexShrink: 0, position: "relative", zIndex: 30}} className="hidden lg:block">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <aside style={{position: "fixed", inset: "0 auto 0 0", width: "220px", zIndex: 30}} className="lg:hidden">
          {sidebarContent}
        </aside>
      )}

      <div style={{flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden"}}>
        <header style={{height: "56px", display: "flex", alignItems: "center", padding: "0 20px", gap: "12px", flexShrink: 0, background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)"}}>
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}
            style={{background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center"}}>
            <Menu size={18} />
          </button>

          <div style={{flex: 1}} />

          <div style={{display: "flex", alignItems: "center", gap: "1px", padding: "4px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)"}}>
            <button onClick={() => !isDark && toggle()}
              style={{padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: "600", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s",
                background: !isDark ? "rgba(255,255,255,0.1)" : "transparent",
                color: !isDark ? "white" : "rgba(255,255,255,0.3)"}}>
              <Sun size={12} /> Light
            </button>
            <button onClick={() => isDark && toggle()}
              style={{padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: "600", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s",
                background: isDark ? "rgba(255,255,255,0.1)" : "transparent",
                color: isDark ? "white" : "rgba(255,255,255,0.3)"}}>
              <Moon size={12} /> Dark
            </button>
          </div>

          {isAdminOrManager && (
            <span style={{padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)"}}>
              {user?.role === "ADMIN" ? "Admin" : "Manager"}
            </span>
          )}

          <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
            <div style={{width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px", color: "white"}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.7)"}} className="hidden sm:block">{user?.name}</span>
          </div>
        </header>

        <main style={{flex: 1, overflow: "auto", padding: "24px"}}>
          <div style={{maxWidth: "1200px", margin: "0 auto"}}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}