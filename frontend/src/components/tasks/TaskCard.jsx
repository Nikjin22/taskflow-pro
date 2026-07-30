import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Calendar } from "lucide-react";
import clsx from "clsx";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../../lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import toast from "react-hot-toast";

const formatDueDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d");
};

export default function TaskCard({ task, compact, onEdit, onDelete }) {
  const queryClient = useQueryClient();
  const priority = PRIORITY_CONFIG[task.priority];
  const status = STATUS_CONFIG[task.status];
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== "DONE";

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/tasks/${task.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: () => toast.error("Failed to update task"),
  });

  const toggleStatus = (e) => {
    e.stopPropagation();
    const next = task.status === "DONE" ? "TODO" : "DONE";
    updateMutation.mutate({ status: next });
  };

  if (compact) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
        <button onClick={toggleStatus} className={clsx("w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors", task.status === "DONE" ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-brand-500")} />
        <div className="flex-1 min-w-0">
          <p className={clsx("text-sm font-medium truncate", task.status === "DONE" && "line-through text-slate-400")}>{task.title}</p>
          <div className="flex items-center gap-2 mt-1">
            {task.project && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: task.project.color }} />
                {task.project.name}
              </span>
            )}
            {dueDate && (
              <span className={clsx("text-xs font-medium", isOverdue ? "text-red-500" : "text-slate-400")}>
                {formatDueDate(dueDate)}
              </span>
            )}
          </div>
        </div>
        <span className={clsx("badge text-xs flex-shrink-0", priority.badge)}>{task.priority}</span>
      </div>
    );
  }

  return (
    <div className="card p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3">
        <button onClick={toggleStatus} className={clsx("w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all duration-150", task.status === "DONE" ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-brand-500 hover:scale-110")} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={clsx("text-sm font-semibold text-slate-900", task.status === "DONE" && "line-through text-slate-400")}>{task.title}</h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={clsx("badge", priority.badge)}>
                <span className={clsx("w-1.5 h-1.5 rounded-full", priority.dot)} />
                {priority.label}
              </span>
              <span className={clsx("badge", status.badge)}>{status.label}</span>
            </div>
          </div>
          {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
          <div className="flex items-center gap-3 mt-2">
            {task.project && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ background: task.project.color }} />
                {task.project.name}
              </span>
            )}
            {dueDate && (
              <span className={clsx("flex items-center gap-1 text-xs font-medium", isOverdue ? "text-red-500" : "text-slate-500")}>
                <Calendar className="w-3 h-3" />
                {isOverdue ? "Overdue · " : ""}{formatDueDate(dueDate)}
              </span>
            )}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button onClick={() => onEdit(task)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(task)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}