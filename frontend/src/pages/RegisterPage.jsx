import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const BRAND = "#6366f1";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name || name.length < 2) errs.name = "Name must be at least 2 characters";
    if (!email || !email.includes("@")) errs.email = "Invalid email address";
    if (!password || password.length < 8) errs.password = "At least 8 characters";
    else if (!/[A-Z]/.test(password)) errs.password = "Include an uppercase letter";
    else if (!/[0-9]/.test(password)) errs.password = "Include a number";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await registerUser(name, email, password);
      toast.success("Account created! Welcome to TaskFlow TaskFlow.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{background: "#fff5f4"}}>
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 relative overflow-hidden" style={{background: "linear-gradient(150deg, #6366f1 0%, #b71c1c 100%)"}}>
        <div className="relative">
          <img src="https://https://via.placeholder.com/120x40/6366f1/ffffff?text=TaskFlow" alt="TaskFlow Pro" className="h-12 object-contain" style={{filter: "brightness(0) invert(1)"}} />
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Join TaskFlow<br />
            <span style={{color: "rgba(255,255,255,0.85)"}}>TaskFlow Today</span>
          </h1>
          <p style={{color: "rgba(255,255,255,0.75)"}} className="text-lg leading-relaxed">
            Collaborate with your team, manage pharmaceutical projects and track tasks — all in one place.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[{num:"35+", label:"Countries"}, {num:"50+", label:"Products"}, {num:"1985", label:"Founded"}].map(({num, label}) => (
              <div key={label} className="rounded-2xl p-4" style={{background: "rgba(255,255,255,0.15)"}}>
                <div className="text-2xl font-bold text-white">{num}</div>
                <div className="text-sm" style={{color: "rgba(255,255,255,0.7)"}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <p style={{color: "rgba(255,255,255,0.5)"}} className="relative text-sm">© 2024 TaskFlow Proceuticals Ltd. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src="https://https://via.placeholder.com/120x40/6366f1/ffffff?text=TaskFlow" alt="TaskFlow Pro" className="h-10 object-contain" />
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
            <p className="text-slate-500 mt-2">Join TaskFlow TaskFlow today</p>
          </div>
          <div className="card p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" className="input" style={errors.name ? {borderColor: "#ef4444"} : {}} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="label">Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@TaskFlowpharma.com" className="input" style={errors.email ? {borderColor: "#ef4444"} : {}} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Min 8 chars, 1 uppercase, 1 number" className="input pr-10" style={errors.password ? {borderColor: "#ef4444"} : {}} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Repeat your password" className="input" style={errors.confirmPassword ? {borderColor: "#ef4444"} : {}} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-opacity mt-2" style={{background: BRAND, opacity: loading ? 0.7 : 1}}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-slate-500 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-medium" style={{color: BRAND}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}