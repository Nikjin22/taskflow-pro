import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import toast from "react-hot-toast";
import { User, Lock, Shield, LogOut, Settings } from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");

  const profileForm = useForm({ defaultValues: { name: user?.name || "" } });
  const passwordForm = useForm({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.patch("/users/profile", data),
    onSuccess: (res) => { updateUser(res.data.user); toast.success("Profile updated!"); },
    onError: () => toast.error("Failed to update profile"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => api.post("/users/change-password", data),
    onSuccess: () => { toast.success("Password changed!"); passwordForm.reset(); },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to change password"),
  });

  const onPasswordSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) { toast.error("Passwords do not match"); return; }
    changePasswordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-500" /> Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage your account preferences</p>
      </div>
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{user?.name}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className="badge bg-brand-50 text-brand-700 mt-1">{user?.role}</span>
        </div>
      </div>
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      {activeTab === "profile" && (
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-slate-900">Profile Information</h3>
          <form onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input {...profileForm.register("name", { required: true })} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={updateProfileMutation.isPending} className="btn-primary">
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="card p-6 space-y-5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-500" /> Change Password
            </h3>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input {...passwordForm.register("currentPassword", { required: true })} type="password" className="input" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input {...passwordForm.register("newPassword", { required: true, minLength: 8 })} type="password" className="input" />
                <p className="text-xs text-slate-400 mt-1">At least 8 characters, 1 uppercase, 1 number</p>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input {...passwordForm.register("confirmPassword", { required: true })} type="password" className="input" />
              </div>
              <button type="submit" disabled={changePasswordMutation.isPending} className="btn-primary">
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Sign Out</h3>
            <button onClick={logout} className="btn-danger flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}