export const DEPARTMENTS = {
  NONE: { label: "No Department", color: "#94a3b8" },
  MANUFACTURING: { label: "Manufacturing", color: "#f59e0b" },
  RD: { label: "R&D / Research", color: "#6366f1" },
  SUPPLY_CHAIN: { label: "Supply Chain", color: "#10b981" },
  QA: { label: "Quality Assurance", color: "#ef4444" },
  SALES_MARKETING: { label: "Sales & Marketing", color: "#ec4899" },
  FINANCE: { label: "Finance & Accounts", color: "#14b8a6" },
  HR_ADMIN: { label: "HR & Admin", color: "#8b5cf6" },
  REGULATORY: { label: "Regulatory Affairs", color: "#f97316" },
  IT: { label: "IT Team", color: "#0ea5e9" },
};

export const ROLES = {
  SUPER_ADMIN: { label: "Super Admin", color: "#6366f1" },
  ADMIN: { label: "Admin", color: "#f59e0b" },
  MANAGER: { label: "Manager", color: "#6366f1" },
  USER: { label: "User", color: "#64748b" },
};

export const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "text-emerald-600", bg: "bg-emerald-50", badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  MEDIUM: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50", badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  HIGH: { label: "High", color: "text-orange-600", bg: "bg-orange-50", badge: "bg-orange-50 text-orange-700", dot: "bg-orange-500" },
  URGENT: { label: "Urgent", color: "text-red-600", bg: "bg-red-50", badge: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

export const STATUS_CONFIG = {
  TODO: { label: "To Do", icon: "○", bg: "bg-slate-100", text: "text-slate-600", badge: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { label: "In Progress", icon: "◑", bg: "bg-blue-50", text: "text-blue-600", badge: "bg-blue-50 text-blue-700" },
  IN_REVIEW: { label: "In Review", icon: "◕", bg: "bg-purple-50", text: "text-purple-600", badge: "bg-purple-50 text-purple-700" },
  DONE: { label: "Done", icon: "●", bg: "bg-emerald-50", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700" },
};

export const PROJECT_COLORS = [
  "#6366f1", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#06b6d4", "#f97316",
];