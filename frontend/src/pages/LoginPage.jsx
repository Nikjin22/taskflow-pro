import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, CheckSquare } from "lucide-react";

const BRAND = "#6366f1";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen flex" style={{background: "#f8fafc"}}>
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12" style={{background: "linear-gradient(150deg, #6366f1 0%, #4338ca 100%)"}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{background: "rgba(255,255,255,0.2)"}}>T</div>
          <span className="text-white font-bold text-xl">TaskFlow Pro</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Manage your team<br />
            <span style={{color: "rgba(255,255,255,0.8)"}}>smarter, not harder</span>
          </h1>
          <p style={{color: "rgba(255,255,255,0.7)"}} className="text-lg leading-relaxed">
            A full-stack project management system with role-based access, real-time updates, and IT helpdesk built in.
          </p>
          <div className="space-y-3">
            {[
              "Role-based access control (Admin, Manager, Team Member)",
              "Real-time task updates and comments",
              "Built-in IT Helpdesk ticketing system",
              "Department management and reporting",
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background: "rgba(255,255,255,0.2)"}}>
                  <CheckSquare className="w-3 h-3 text-white" />
                </div>
                <p style={{color: "rgba(255,255,255,0.8)"}} className="text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </div>
        <p style={{color: "rgba(255,255,255,0.4)"}} className="text-sm">Built with React · Node.js · PostgreSQL · Prisma</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{background: BRAND}}>T</div>
            <span className="font-bold text-xl text-slate-900">TaskFlow Pro</span>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Sign in</h2>
            <p className="text-slate-500 mt-2">Access your TaskFlow Pro workspace</p>
          </div>
          <div className="card p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" className="input" />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Your password" className="input pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-opacity" style={{background: BRAND, opacity: loading ? 0.7 : 1}}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}