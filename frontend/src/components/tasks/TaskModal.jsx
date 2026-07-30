import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../../lib/constants";

const schema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
});

export default function TaskModal({ task, projectId, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!task;

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects").then((r) => r.data),
    enabled: !projectId,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: task ? {
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    } : { status: "TODO", priority: "MEDIUM" },
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const pid = projectId || data.projectId;
      return api.post(`/tasks/project/${pid}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task created!");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to create task"),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/tasks/${task.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task updated!");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update task"),
  });

  const onSubmit = (data) => {
    const payload = { ...data, dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null };
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card w-full max-w-lg shadow-xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="label">Title *</label>
            <input {...register("title")} placeholder="Task title..." className={`input ${errors.title ? "border-red-400" : ""}`} autoFocus />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register("description")} placeholder="Add details..." rows={3} className="textarea" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select {...register("status")} className="input">
                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                  <option key={val} value={val}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select {...register("priority")} className="input">
                {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                  <option key={val} value={val}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input {...register("dueDate")} type="date" className="input" />
          </div>
          {!projectId && !isEdit && (
            <div>
              <label className="label">Project *</label>
              <select {...register("projectId")} className="input">
                <option value="">Select project...</option>
                {projectsData?.projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}