-- Add expiration date field to productos table
ALTER TABLE productos 
ADD COLUMN fecha_vencimiento DATE;

-- Add index for faster queries on expiration date
CREATE INDEX idx_productos_fecha_vencimiento ON productos(fecha_vencimiento) WHERE fecha_vencimiento IS NOT NULL;

-- Add index for low stock queries
CREATE INDEX idx_productos_stock_bajo ON productos(stock, stock_minimo) WHERE stock <= stock_minimo;
