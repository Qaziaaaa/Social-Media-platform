import { useState } from "react";
import { Link } from "react-router-dom";
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
  archived: "badge-surface",
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
          <h1 className="font-headline-lg text-headline-lg text-text">Projects</h1>
          <p className="font-body-sm text-body-sm text-text-secondary mt-1">
            Track your building journey
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm((p) => !p)}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Project
        </Button>
      </div>

      {showForm && (
        <div className="card p-lg mb-lg animate-fade-in">
          <h3 className="font-label-lg text-label-lg text-text mb-md">New Project</h3>
          <div className="flex flex-col gap-md">
            <input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-3.5 py-2.5 text-body-md text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
            <textarea
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-surface border border-border rounded-md px-3.5 py-2.5 text-body-md text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-3.5 py-2.5 text-body-md text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
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
          <div className="h-16 w-16 rounded-full bg-surface-hover flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-3xl text-text-secondary">folder</span>
          </div>
          <p className="text-text-secondary text-sm mb-1">No projects yet</p>
          <p className="text-xs text-text-tertiary">Click "New Project" to start documenting your build</p>
        </div>
      )}

      <div className="flex flex-col gap-md">
        {projects?.map((project) => (
          <div
            key={project.id}
            className="group card p-lg"
          >
            <div className="flex items-start justify-between gap-sm">
              <Link to={`/projects/${project.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-sm mb-1">
                  <h3 className="font-label-lg text-label-lg text-text font-semibold truncate group-hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[project.status]}`}>
                    {STATUS_LABELS[project.status]}
                  </span>
                </div>
                {project.description && (
                  <p className="font-body-sm text-body-sm text-text-secondary line-clamp-2 mb-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-md text-xs text-text-tertiary">
                  {project.techStack.length > 0 && (
                    <span>{project.techStack.length} tech stack items</span>
                  )}
                </div>
              </Link>
              <button
                onClick={() => {
                  if (confirm("Delete this project?")) deleteMutation.mutate(project.id);
                }}
                className="text-text-tertiary hover:text-danger hover:bg-danger-subtle p-1.5 rounded-lg transition-all shrink-0"
                title="Delete project"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
