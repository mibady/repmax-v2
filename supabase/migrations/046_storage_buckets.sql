-- Create storage buckets for athlete file uploads

-- Athlete photos bucket (profile images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('athlete-photos', 'athlete-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Athlete documents bucket (transcripts, test scores, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('athlete-documents', 'athlete-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for athlete-photos
CREATE POLICY "Anyone can view athlete photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'athlete-photos');

CREATE POLICY "Authenticated users can upload athlete photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'athlete-photos');

CREATE POLICY "Users can update their own athlete photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'athlete-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own athlete photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'athlete-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for athlete-documents
CREATE POLICY "Anyone can view athlete documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'athlete-documents');

CREATE POLICY "Authenticated users can upload athlete documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'athlete-documents');

CREATE POLICY "Users can update their own athlete documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'athlete-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own athlete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'athlete-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
