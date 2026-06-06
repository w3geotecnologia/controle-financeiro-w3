-- Add color column to creditcards table
ALTER TABLE creditcards 
ADD COLUMN color text DEFAULT 'blue';

COMMENT ON COLUMN creditcards.color IS 'Color identifier for the credit card display';