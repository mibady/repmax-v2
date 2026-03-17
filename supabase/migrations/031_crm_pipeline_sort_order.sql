-- Add sort_order column for vertical reordering within pipeline columns
ALTER TABLE crm_pipeline ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Index for efficient ordering within stage
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stage_sort ON crm_pipeline(recruiter_id, stage, sort_order);
