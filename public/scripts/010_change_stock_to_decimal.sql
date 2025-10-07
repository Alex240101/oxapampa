-- Change stock and stock_minimo columns to support decimal values
ALTER TABLE productos 
ALTER COLUMN stock TYPE NUMERIC(10, 2);

ALTER TABLE productos 
ALTER COLUMN stock_minimo TYPE NUMERIC(10, 2);

-- Update any existing NULL values to 0
UPDATE productos SET stock = 0 WHERE stock IS NULL;
UPDATE productos SET stock_minimo = 0 WHERE stock_minimo IS NULL;
