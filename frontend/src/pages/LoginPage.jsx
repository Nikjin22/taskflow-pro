import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, Zap, Shield, Users, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();
  const { isDark } = useThemeStore();
  const navigate = useNavigate();

  const bg = isDark ? "#0f1117" : "#f4f6fb";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "white";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const textMain = isDark ? "white" : "#0f172a";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "white";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const inputColor = isDark ? "white" : "#0f172a";
  const leftBg = isDark
    ? "linear-gradient(135deg, #0f1117 0%, #13111e 100%)"
    : "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid email or password");
    } finally { setLoading(false); }
  };

  const tryDemo = async () => {
    setDemoLoading(true);
    try {
      await login("demo@taskflow.app", "Demo@1234");
      toast.success("Welcome! You are viewing as a Team Member.");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Demo login failed. Please try again.");
    } finally { setDemoLoading(false); }
  };

  const features = [
    { icon: BarChart3, title: "Real-time Dashboard", desc: "Live project tracking and analytics" },
    { icon: Users, title: "Team Management", desc: "Role-based access control" },
    { icon: Shield, title: "IT Helpdesk", desc: "Built-in ticketing system" },
    { icon: Zap, title: "Instant Updates", desc: "Live sync across all members" },
  ];

  return (
    <div style={{minHeight: "100vh", display: "flex", fontFamily: "Inter, DM Sans, system-ui, sans-serif", background: bg}}>
      {/* Left Panel */}
      <div style={{flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 48px", background: leftBg, position: "relative", overflow: "hidden"}}
        className="hidden lg:flex">
        <div style={{position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(99,102,241,0.12)", filter: "blur(80px)", pointerEvents: "none"}} />
        <div style={{position: "absolute", bottom: "-50px", left: "-50px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(139,92,246,0.08)", filter: "blur(60px)", pointerEvents: "none"}} />

        <div style={{display: "flex", alignItems: "center", gap: "12px", position: "relative"}}>
          <div style={{width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "16px", color: "white", boxShadow: "0 4px 15px rgba(99,102,241,0.4)"}}>T</div>
          <span style={{color: "white", fontWeight: "700", fontSize: "18px", letterSpacing: "-0.3px"}}>TaskFlow Pro</span>
        </div>

        <div style={{position: "relative"}}>
          <div style={{display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px", borderRadius: "999px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", marginBottom: "20px"}}>
            <div style={{width: "5px", height: "5px", borderRadius: "50%", background: "#818cf8"}} />
            <span style={{fontSize: "11px", color: "#a5b4fc", fontWeight: "600", letterSpacing: "0.3px"}}>Full-Stack Portfolio Project</span>
          </div>
          <h1 style={{fontSize: "42px", fontWeight: "800", color: "white", lineHeight: "1.15", letterSpacing: "-1px", margin: "0 0 16px"}}>
            Manage your team<br />
            <span style={{background: "linear-gradient(135deg, #818cf8, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>smarter, not harder</span>
          </h1>
          <p style={{fontSize: "15px", color: "rgba(255,255,255,0.55)", lineHeight: "1.7", margin: "0 0 32px", maxWidth: "380px"}}>
            A production-ready project management system with real-time collaboration, role-based access and IT helpdesk.
          </p>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "420px"}}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)"}}>
                <div style={{width: "28px", height: "28px", borderRadius: "7px", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px"}}>
                  <Icon size={14} color="#818cf8" />
                </div>
                <p style={{fontSize: "12px", fontWeight: "600", color: "white", margin: "0 0 3px"}}>{title}</p>
                <p style={{fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: "1.4"}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{display: "flex", gap: "6px", position: "relative"}}>
          {["React 18", "Node.js", "PostgreSQL", "Prisma", "Vercel"].map(tech => (
            <span key={tech} style={{padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.07)", fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "500", border: "1px solid rgba(255,255,255,0.08)"}}>{tech}</span>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 36px", borderLeft: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0"}}>
        <div className="lg:hidden" style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px"}}>
          <div style={{width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", color: "white"}}>T</div>
          <span style={{fontWeight: "700", fontSize: "15px", color: textMain}}>TaskFlow Pro</span>
        </div>

        <div style={{marginBottom: "28px"}}>
          <h2 style={{fontSize: "26px", fontWeight: "700", color: textMain, margin: "0 0 6px", letterSpacing: "-0.5px"}}>Welcome back</h2>
          <p style={{fontSize: "14px", color: textMuted, margin: 0}}>Sign in to your workspace</p>
        </div>

        {/* Demo Button */}
        <button onClick={tryDemo} disabled={demoLoading}
          style={{width: "100%", padding: "13px", borderRadius: "11px", border: "1px solid rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.08)", color: "#818cf8", fontWeight: "600", fontSize: "13px", cursor: "pointer", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s", fontFamily: "inherit"}}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)"; }}>
          {demoLoading
            ? <div style={{width: "15px", height: "15px", border: "2px solid rgba(129,140,248,0.3)", borderTop: "2px solid #818cf8", borderRadius: "50%", animation: "spin 1s linear infinite"}} />
            : <><Zap size={15} /> Try Demo — One Click, No Login Needed</>
          }
        </button>

        <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px"}}>
          <div style={{flex: 1, height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}} />
          <span style={{fontSize: "11px", color: textMuted, fontWeight: "500", whiteSpace: "nowrap"}}>or sign in with email</span>
          <div style={{flex: 1, height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}} />
        </div>

        <form onSubmit={onSubmit} style={{display: "flex", flexDirection: "column", gap: "14px"}}>
          <div>
            <label style={{display: "block", fontSize: "11px", fontWeight: "600", color: textMuted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "7px"}}>Email Address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com"
              style={{width: "100%", padding: "11px 16px", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", background: inputBg, border: "1px solid " + inputBorder, color: inputColor, outline: "none", boxSizing: "border-box"}} />
          </div>
          <div>
            <label style={{display: "block", fontSize: "11px", fontWeight: "600", color: textMuted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "7px"}}>Password</label>
            <div style={{position: "relative"}}>
              <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Your password"
                style={{width: "100%", padding: "11px 42px 11px 16px", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", background: inputBg, border: "1px solid " + inputBorder, color: inputColor, outline: "none", boxSizing: "border-box"}} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: textMuted, display: "flex", alignItems: "center", padding: 0}}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 15px rgba(99,102,241,0.25)", marginTop: "4px"}}>
            {loading
              ? <div style={{width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite"}} />
              : <><span>Sign In</span><ArrowRight size={15} /></>
            }
          </button>
        </form>

        <div style={{marginTop: "24px", padding: "14px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: "1px solid " + cardBorder}}>
          <p style={{fontSize: "11px", fontWeight: "600", color: textMuted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px"}}>Available Roles to Explore</p>
          <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
            {[
              { role: "Demo User", desc: "View-only access to all features" },
              { role: "Team Member", desc: "Update tasks and add comments" },
              { role: "IT Manager", desc: "Create projects and assign tasks" },
              { role: "Admin", desc: "Full system management" },
            ].map(({ role, desc }) => (
              <div key={role} style={{display: "flex", alignItems: "center", gap: "8px"}}>
                <div style={{width: "5px", height: "5px", borderRadius: "50%", background: "#6366f1", flexShrink: 0}} />
                <p style={{fontSize: "12px", color: textMuted, margin: 0}}><strong style={{color: textMain, fontWeight: "600"}}>{role}</strong> — {desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{fontSize: "11px", color: isDark ? "rgba(255,255,255,0.2)" : "#94a3b8", textAlign: "center", marginTop: "24px", lineHeight: "1.6"}}>
          React 18 · Node.js · PostgreSQL · Prisma · Deployed on Vercel + Railway
        </p>
      </div>
    </div>
  );
}