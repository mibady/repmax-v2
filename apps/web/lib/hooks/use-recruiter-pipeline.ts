import { useState, useEffect, useCallback } from "react";

export type CrmStage = "identified" | "contacted" | "evaluating" | "visit_scheduled" | "offered" | "committed";

export interface PipelineEntry {
  id: string;
  stage: CrmStage;
  priority: string | null;
  notes: string | null;
  last_touch: string;
  tags: string[] | null;
  athlete: {
    id: string;
    primary_position: string;
    class_year: number;
    zone: string | null;
    state: string | null;
    star_rating: number | null;
    repmax_score: number | null;
    offers_count: number;
    high_school: string | null;
    profile: { full_name: string; avatar_url: string | null } | null;
  };
}

export function useRecruiterPipeline() {
  const [pipeline, setPipeline] = useState<PipelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPipeline = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/recruiter/pipeline");
    if (res.ok) {
      const data = await res.json();
      setPipeline(data.pipeline || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchPipeline(); }, [fetchPipeline]);

  const moveToStage = useCallback(async (pipeline_id: string, stage: CrmStage) => {
    await fetch("/api/recruiter/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline_id, stage }),
    });
    setPipeline(prev => prev.map(e => e.id === pipeline_id ? { ...e, stage } : e));
  }, []);

  const addToPipeline = useCallback(async (athlete_id: string, stage: CrmStage = "identified") => {
    const res = await fetch("/api/recruiter/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athlete_id, stage }),
    });
    if (res.ok) await fetchPipeline();
  }, [fetchPipeline]);

  return { pipeline, isLoading, moveToStage, addToPipeline };
}
