-- Create table for user access logs (login/logout tracking)
CREATE TABLE public.user_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.user_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view all access logs
CREATE POLICY "Admins can view all access logs"
ON public.user_access_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert access logs (via edge function or trigger)
CREATE POLICY "Admins can insert access logs"
ON public.user_access_logs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to insert their own logs
CREATE POLICY "Users can insert own access logs"
ON public.user_access_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_access_logs_user_id ON public.user_access_logs(user_id);
CREATE INDEX idx_user_access_logs_created_at ON public.user_access_logs(created_at DESC);