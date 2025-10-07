-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar categoría por defecto
INSERT INTO categorias (nombre, descripcion, activa)
VALUES ('Sin categoría', 'Categoría por defecto para productos sin clasificar', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar otras categorías comunes para ferretería
INSERT INTO categorias (nombre, descripcion, activa)
VALUES 
  ('Iluminación', 'Productos de iluminación LED y tradicional', true),
  ('Enchapes', 'Enchapes y revestimientos', true),
  ('Cajas Eléctricas', 'Cajas de paso y distribución eléctrica', true),
  ('Spots LED', 'Focos empotrados LED', true),
  ('Paneles LED', 'Paneles de iluminación LED', true)
ON CONFLICT (nombre) DO NOTHING;

-- Agregar columna categoria_id a productos si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'categoria_id'
  ) THEN
    ALTER TABLE productos ADD COLUMN categoria_id UUID REFERENCES categorias(id);
  END IF;
END $$;

-- Migrar datos de categoria (text) a categoria_id (UUID)
-- Primero, crear categorías para todos los valores únicos existentes
INSERT INTO categorias (nombre, activa)
SELECT DISTINCT categoria, true
FROM productos
WHERE categoria IS NOT NULL 
  AND categoria != ''
  AND NOT EXISTS (
    SELECT 1 FROM categorias WHERE nombre = productos.categoria
  );

-- Actualizar categoria_id basándose en el texto de categoria
UPDATE productos p
SET categoria_id = c.id
FROM categorias c
WHERE p.categoria = c.nombre
  AND p.categoria_id IS NULL;

-- Asignar categoría por defecto a productos sin categoría
UPDATE productos
SET categoria_id = (SELECT id FROM categorias WHERE nombre = 'Sin categoría')
WHERE categoria_id IS NULL;

-- Opcional: Eliminar la columna categoria (text) después de migrar
-- Descomenta estas líneas si quieres eliminar la columna antigua
-- ALTER TABLE productos DROP COLUMN IF EXISTS categoria;

COMMENT ON TABLE categorias IS 'Categorías de productos para la ferretería Ilumitek';
COMMENT ON COLUMN productos.categoria_id IS 'Referencia a la categoría del producto';
