-- Add column to track if invoice should be included in statistics
ALTER TABLE public.invoices 
ADD COLUMN include_in_stats boolean NOT NULL DEFAULT true;