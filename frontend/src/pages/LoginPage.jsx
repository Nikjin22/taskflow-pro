import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, Zap, Shield, Users, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();
  const navigate = useNavigate();

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
      await login("admin@taskflow.app", "Admin@1234");
      toast.success("Welcome to TaskFlow Pro!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Demo login failed. Please try again.");
    } finally { setDemoLoading(false); }
  };

  const features = [
    { icon: BarChart3, title: "Real-time Dashboard", desc: "Live project tracking and team analytics" },
    { icon: Users, title: "Team Management", desc: "Role-based access with full audit trail" },
    { icon: Shield, title: "IT Helpdesk", desc: "Built-in ticketing system for support" },
    { icon: Zap, title: "Instant Updates", desc: "Live sync across all team members" },
  ];

  return (
    <div style={{minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "Inter, system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 50%)"}}>

      {/* Left Panel */}
      <div style={{flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", borderRight: "1px solid rgba(255,255,255,0.06)"}} className="hidden lg:flex">
        <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
          <div style={{width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "16px", color: "white", boxShadow: "0 4px 15px rgba(99,102,241,0.4)"}}>T</div>
          <span style={{color: "white", fontWeight: "700", fontSize: "18px", letterSpacing: "-0.3px"}}>TaskFlow Pro</span>
        </div>

        <div>
          <div style={{marginBottom: "48px"}}>
            <div style={{display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", marginBottom: "24px"}}>
              <div style={{width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1"}} />
              <span style={{fontSize: "12px", color: "#818cf8", fontWeight: "600"}}>Full-Stack Portfolio Project</span>
            </div>
            <h1 style={{fontSize: "48px", fontWeight: "800", color: "white", lineHeight: "1.1", letterSpacing: "-1px", margin: "0 0 16px"}}>
              Manage your team<br />
              <span style={{background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>smarter, not harder</span>
            </h1>
            <p style={{fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: "1.7", margin: 0, maxWidth: "400px"}}>
              A production-ready project management system with role-based access control, real-time collaboration and IT helpdesk.
            </p>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)"}}>
                <div style={{width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px"}}>
                  <Icon size={16} color="#818cf8" />
                </div>
                <p style={{fontSize: "13px", fontWeight: "600", color: "white", margin: "0 0 4px"}}>{title}</p>
                <p style={{fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: "1.5"}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
          <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
            {["React 18", "Node.js", "PostgreSQL", "Prisma"].map(tech => (
              <span key={tech} style={{padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "500"}}>{tech}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 40px"}}>
        <div className="lg:hidden" style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px"}}>
          <div style={{width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "14px", color: "white"}}>T</div>
          <span style={{color: "white", fontWeight: "700", fontSize: "16px"}}>TaskFlow Pro</span>
        </div>

        <div style={{marginBottom: "32px"}}>
          <h2 style={{fontSize: "28px", fontWeight: "700", color: "white", margin: "0 0 8px", letterSpacing: "-0.5px"}}>Welcome back</h2>
          <p style={{fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0}}>Sign in to your workspace</p>
        </div>

        {/* Demo Button */}
        <button onClick={tryDemo} disabled={demoLoading}
          style={{width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.1)", color: "#818cf8", fontWeight: "600", fontSize: "14px", cursor: "pointer", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s", fontFamily: "inherit"}}>
          {demoLoading
            ? <div style={{width: "16px", height: "16px", border: "2px solid rgba(129,140,248,0.3)", borderTop: "2px solid #818cf8", borderRadius: "50%", animation: "spin 1s linear infinite"}} />
            : <>
                <Zap size={16} />
                Try Demo — One Click, No Login Needed
              </>
          }
        </button>

        <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px"}}>
          <div style={{flex: 1, height: "1px", background: "rgba(255,255,255,0.08)"}} />
          <span style={{fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: "500"}}>or sign in with email</span>
          <div style={{flex: 1, height: "1px", background: "rgba(255,255,255,0.08)"}} />
        </div>

        <form onSubmit={onSubmit} style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          <div>
            <label style={{display: "block", fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px"}}>Email Address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com"
              style={{width: "100%", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", boxSizing: "border-box"}} />
          </div>
          <div>
            <label style={{display: "block", fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px"}}>Password</label>
            <div style={{position: "relative"}}>
              <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Your password"
                style={{width: "100%", padding: "12px 44px 12px 16px", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", boxSizing: "border-box"}} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center"}}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{width: "100%", padding: "13px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 15px rgba(99,102,241,0.3)"}}>
            {loading
              ? <div style={{width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite"}} />
              : <><span>Sign In</span><ArrowRight size={16} /></>
            }
          </button>
        </form>

        <p style={{fontSize: "12px", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "32px", lineHeight: "1.6"}}>
          Built with React 18 · Node.js · PostgreSQL · Prisma ORM<br />
          Deployed on Vercel + Railway
        </p>
      </div>
    </div>
  );
}