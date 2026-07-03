import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Project, Milestone } from "@/types";

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

const MILESTONE_COLORS: Record<string, string> = {
  planned: "badge-surface",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const MILESTONE_LABELS: Record<string, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [milestoneName, setMilestoneName] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneDue, setMilestoneDue] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: queryKeys.milestones.byProject(id!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Milestone[]>>(`/milestones/project/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const isOwnProject = project?.userId === currentUser?.id;

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        projectId: id,
        name: milestoneName,
        description: milestoneDesc || undefined,
      };
      if (milestoneDue) payload.dueDate = new Date(milestoneDue).toISOString();
      const { data } = await api.post<ApiResponse<Milestone>>("/milestones", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byProject(id!) });
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      setShowForm(false);
      setMilestoneName("");
      setMilestoneDesc("");
      setMilestoneDue("");
      toast.success("Milestone created");
    },
    onError: () => toast.error("Failed to create milestone"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ milestoneId, status }: { milestoneId: string; status: string }) => {
      await api.patch(`/milestones/${milestoneId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byProject(id!) });
      toast.success("Milestone updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (milestoneId: string) => api.delete(`/milestones/${milestoneId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byProject(id!) });
      toast.success("Milestone deleted");
    },
  });

  const progress = milestones
    ? Math.round((milestones.filter((m) => m.status === "completed").length / milestones.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card p-lg text-center">
        <p className="text-text-secondary">Project not found</p>
        <Button variant="ghost" className="mt-md" onClick={() => navigate("/projects")}>
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-lg">
      <div>
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-1 text-body-sm text-text-secondary hover:text-accent transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to projects
        </button>
      </div>

      {/* Project Header */}
      <section className="card p-lg">
        <div className="flex items-start justify-between gap-sm mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="font-headline-lg text-headline-lg text-text truncate">{project.name}</h1>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[project.status]}`}>
                {STATUS_LABELS[project.status]}
              </span>
            </div>
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="badge badge-surface">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
          {isOwnProject && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (confirm("Delete this project?")) {
                  api.delete(`/projects/${id}`).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["projects"] });
                    toast.success("Project deleted");
                    navigate("/projects");
                  });
                }
              }}
            >
              Delete
            </Button>
          )}
        </div>
        {project.description && (
          <p className="font-body-md text-body-md text-text-secondary max-w-2xl leading-relaxed">{project.description}</p>
        )}
      </section>

      {/* Milestones */}
      <section className="card p-lg">
        <div className="flex items-center justify-between mb-md">
          <div>
            <h2 className="font-label-lg text-label-lg text-text font-semibold">Milestones</h2>
            {milestones && milestones.length > 0 && (
              <p className="font-body-sm text-body-sm text-text-secondary mt-0.5">
                {milestones.filter((m) => m.status === "completed").length} / {milestones.length} completed
              </p>
            )}
          </div>
          {isOwnProject && (
            <Button variant="primary" size="sm" onClick={() => setShowForm((p) => !p)}>
              <span className="material-symbols-outlined text-lg mr-1">add</span>
              Milestone
            </Button>
          )}
        </div>

        {milestones && milestones.length > 0 && (
          <div className="w-full bg-surface-hover rounded-full h-1.5 mb-lg">
            <div
              className="bg-accent h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {showForm && (
          <div className="bg-surface-hover rounded-lg p-md mb-lg animate-fade-in">
            <h3 className="font-label-md text-label-md text-text mb-3">New Milestone</h3>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Milestone name"
                value={milestoneName}
                onChange={(e) => setMilestoneName(e.target.value)}
              />
              <input
                placeholder="Description (optional)"
                value={milestoneDesc}
                onChange={(e) => setMilestoneDesc(e.target.value)}
              />
              <input
                type="date"
                value={milestoneDue}
                onChange={(e) => setMilestoneDue(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!milestoneName.trim() || createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {milestonesLoading && (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        )}

        {!milestonesLoading && (!milestones || milestones.length === 0) && !showForm && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-surface-hover flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl text-text-secondary">flag</span>
            </div>
            <p className="text-text-secondary text-sm">No milestones yet</p>
            {isOwnProject && (
              <p className="text-xs text-text-tertiary mt-1">Break your project into milestones</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {milestones?.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors border border-border"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => {
                    if (!isOwnProject) return;
                    const nextStatus =
                      milestone.status === "planned"
                        ? "in_progress"
                        : milestone.status === "in_progress"
                          ? "completed"
                          : "planned";
                    updateMutation.mutate({ milestoneId: milestone.id, status: nextStatus });
                  }}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    milestone.status === "completed"
                      ? "bg-accent border-accent text-bg"
                      : milestone.status === "in_progress"
                        ? "border-blue-500"
                        : "border-border hover:border-accent"
                  }`}
                >
                  {milestone.status === "completed" && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                  {milestone.status === "in_progress" && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-label-md text-label-md text-text ${
                      milestone.status === "completed" ? "line-through text-text-secondary" : ""
                    }`}>
                      {milestone.name}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${MILESTONE_COLORS[milestone.status]}`}>
                      {MILESTONE_LABELS[milestone.status]}
                    </span>
                  </div>
                  {milestone.description && (
                    <p className="text-body-sm text-text-secondary mt-0.5">{milestone.description}</p>
                  )}
                  {milestone.dueDate && (
                    <p className="text-caption text-text-tertiary mt-0.5">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {isOwnProject && (
                <button
                  onClick={() => {
                    if (confirm("Delete this milestone?")) deleteMutation.mutate(milestone.id);
                  }}
                  className="text-text-tertiary hover:text-danger p-1 rounded-full hover:bg-surface-hover transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
