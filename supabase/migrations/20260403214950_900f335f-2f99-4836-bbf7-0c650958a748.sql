CREATE POLICY "Users can delete own files"
ON public.files FOR DELETE TO authenticated
USING (user_id = auth.uid());