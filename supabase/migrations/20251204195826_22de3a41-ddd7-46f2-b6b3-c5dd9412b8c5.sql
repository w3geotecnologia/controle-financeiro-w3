-- Add RLS policy for admins to delete access logs
CREATE POLICY "Admins can delete access logs"
ON public.user_access_logs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));