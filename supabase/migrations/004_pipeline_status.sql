-- RepMax v2 Pipeline Status Migration
-- Adds pipeline_status field to shortlists table for Kanban pipeline tracking

-- Create pipeline status enum
CREATE TYPE pipeline_status AS ENUM (
    'identified',
    'contacted',
    'evaluating',
    'visit_scheduled',
    'offered',
    'committed'
);

-- Add pipeline_status column to shortlists
ALTER TABLE shortlists
ADD COLUMN pipeline_status pipeline_status DEFAULT 'identified';

-- Add updated_at column to shortlists for tracking activity
ALTER TABLE shortlists
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Create trigger to update updated_at on shortlists
CREATE TRIGGER shortlists_updated_at
    BEFORE UPDATE ON shortlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add index for pipeline_status filtering
CREATE INDEX idx_shortlists_pipeline_status ON shortlists(pipeline_status);

-- Comment for documentation
COMMENT ON COLUMN shortlists.pipeline_status IS 'Tracks the athlete through the recruiting pipeline stages';
