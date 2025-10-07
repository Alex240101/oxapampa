-- Agregar campo tienda a la tabla productos
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS tienda VARCHAR(100) DEFAULT 'Principal';

-- Crear índice para búsquedas por tienda
CREATE INDEX IF NOT EXISTS idx_productos_tienda ON productos(tienda);

-- Comentario sobre el campo
COMMENT ON COLUMN productos.tienda IS 'Nombre de la tienda o sucursal donde se encuentra el producto';
