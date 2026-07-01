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
  archived: "bg-surface-container-high text-on-surface-variant",
};

const STATUS_LABELS: Record<string, string> = {
  idea: "Idea",
  in_progress: "In Progress",
  testing: "Testing",
  completed: "Completed",
  archived: "Archived",
};

const MILESTONE_COLORS: Record<string, string> = {
  planned: "bg-surface-container-high text-on-surface-variant",
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
  const [editingId, setEditingId] = useState<string | null>(null);

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
      <div className="bg-surface rounded-xl p-lg text-center border border-surface-container-high">
        <p className="text-on-surface-variant">Project not found</p>
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
          className="flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-primary mb-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to projects
        </button>
      </div>

      <section className="bg-surface rounded-xl p-lg border border-surface-container-high">
        <div className="flex items-start justify-between gap-sm mb-sm">
          <div>
            <div className="flex items-center gap-sm mb-xs">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">{project.name}</h1>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[project.status]}`}>
                {STATUS_LABELS[project.status]}
              </span>
            </div>
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-sm">
                {project.techStack.map((tech) => (
                  <span key={tech} className="bg-surface-container-high text-on-surface-variant text-[11px] font-medium px-2 py-0.5 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-sm shrink-0">
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
        </div>
        {project.description && (
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">{project.description}</p>
        )}
      </section>

      <section className="bg-surface rounded-xl p-lg border border-surface-container-high">
        <div className="flex items-center justify-between mb-md">
          <div>
            <h2 className="font-label-lg text-label-lg text-on-surface font-semibold">Milestones</h2>
            {milestones && milestones.length > 0 && (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
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
          <div className="w-full bg-surface-container-low rounded-full h-1.5 mb-lg">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {showForm && (
          <div className="bg-surface-container-low rounded-lg p-md mb-lg animate-fade-in">
            <h3 className="font-label-md text-label-md text-on-surface mb-sm">New Milestone</h3>
            <div className="flex flex-col gap-sm">
              <input
                placeholder="Milestone name"
                value={milestoneName}
                onChange={(e) => setMilestoneName(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                placeholder="Description (optional)"
                value={milestoneDesc}
                onChange={(e) => setMilestoneDesc(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="date"
                value={milestoneDue}
                onChange={(e) => setMilestoneDue(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-sm justify-end">
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
          <div className="space-y-sm">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        )}

        {!milestonesLoading && (!milestones || milestones.length === 0) && !showForm && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-surface-container-high flex items-center justify-center mb-sm">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">flag</span>
            </div>
            <p className="text-on-surface-variant text-sm">No milestones yet</p>
            {isOwnProject && (
              <p className="text-xs text-on-surface-variant/60 mt-xs">Break your project into milestones</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-sm">
          {milestones?.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-start justify-between gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors border border-surface-container-high"
            >
              <div className="flex items-start gap-sm flex-1 min-w-0">
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
                      ? "bg-primary border-primary text-on-primary"
                      : milestone.status === "in_progress"
                        ? "border-blue-500 bg-blue-50"
                        : "border-outline-variant hover:border-primary"
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
                  <div className="flex items-center gap-sm">
                    <span className={`font-label-md text-label-md text-on-surface ${
                      milestone.status === "completed" ? "line-through text-on-surface-variant" : ""
                    }`}>
                      {milestone.name}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${MILESTONE_COLORS[milestone.status]}`}>
                      {MILESTONE_LABELS[milestone.status]}
                    </span>
                  </div>
                  {milestone.description && (
                    <p className="text-body-sm text-on-surface-variant mt-0.5">{milestone.description}</p>
                  )}
                  {milestone.dueDate && (
                    <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
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
                  className="text-on-surface-variant hover:text-error p-xs rounded-full hover:bg-surface-container-low transition-colors shrink-0 opacity-0 group-hover:opacity-100"
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
