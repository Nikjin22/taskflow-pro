import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { PROJECT_COLORS } from "../../lib/constants";
import { useState } from "react";
import clsx from "clsx";

const schema = z.object({
  name: z.string().min(1, "Project name required").max(100),
  description: z.string().max(500).optional(),
});

export default function ProjectModal({ project, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!project;
  const [color, setColor] = useState(project?.color || "#6366f1");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: project ? { name: project.name, description: project.description || "" } : {},
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created!");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed"),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/projects/${project.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      toast.success("Project updated!");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed"),
  });

  const onSubmit = (data) => {
    const payload = { ...data, color };
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card w-full max-w-md shadow-xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Project" : "New Project"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="label">Project Name *</label>
            <input {...register("name")} placeholder="My awesome project" className={`input ${errors.name ? "border-red-400" : ""}`} autoFocus />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register("description")} placeholder="What is this project about?" rows={3} className="textarea" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={clsx("w-8 h-8 rounded-full transition-transform", color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105")} style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center" style={{ background: color }}>
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}