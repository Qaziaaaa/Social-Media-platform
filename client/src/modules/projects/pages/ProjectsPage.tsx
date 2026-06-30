import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { ApiResponse, Project } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  idea: "bg-purple-100 text-purple-700",
  in_progress: "bg-blue-100 text-blue-700",
  testing: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  archived: "bg-surface-container-high text-on-surface-variant",
};

const STATUS_LABELS: Record<string, string> = {
  idea: "Idea",
  in_progress: "In Progress",
  testing: "Testing",
  completed: "Completed",
  archived: "Archived",
};

export function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idea");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project[]>>("/projects");
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<Project>>("/projects", {
        name,
        description: description || undefined,
        status,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
      setName("");
      setDescription("");
      setStatus("idea");
      toast.success("Project created");
    },
    onError: () => toast.error("Failed to create project"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Projects</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Track your building journey
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm((p) => !p)}>
          <span className="material-symbols-outlined text-lg mr-1">add</span>
          New Project
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-xl p-lg border border-surface-container-high mb-lg animate-fade-in">
          <h3 className="font-label-lg text-label-lg text-on-surface mb-md">New Project</h3>
          <div className="flex flex-col gap-md">
            <input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="idea">Idea</option>
              <option value="in_progress">In Progress</option>
              <option value="testing">Testing</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <div className="flex gap-sm justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!name.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-md">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (!projects || projects.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-surface-container-high flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">folder</span>
          </div>
          <p className="text-on-surface-variant text-sm mb-xs">No projects yet</p>
          <p className="text-xs text-on-surface-variant/60">Click "New Project" to start documenting your build</p>
        </div>
      )}

      <div className="flex flex-col gap-md">
        {projects?.map((project) => (
          <div
            key={project.id}
            className="bg-surface rounded-xl p-lg border border-surface-container-high hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-sm mb-xs">
                  <h3 className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                    {project.name}
                  </h3>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[project.status]}`}>
                    {STATUS_LABELS[project.status]}
                  </span>
                </div>
                {project.description && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-sm">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-md text-xs text-on-surface-variant">
                  {project.techStack.length > 0 && (
                    <span>{project.techStack.length} tech stack items</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this project?")) deleteMutation.mutate(project.id);
                }}
                className="text-on-surface-variant hover:text-error p-xs rounded-full hover:bg-surface-container-low transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
