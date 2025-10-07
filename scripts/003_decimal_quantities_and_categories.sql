-- Modificar tabla productos para soportar cantidades decimales
ALTER TABLE productos 
ALTER COLUMN stock TYPE NUMERIC(10, 2);

ALTER TABLE productos 
ALTER COLUMN stock_minimo TYPE NUMERIC(10, 2);

-- Modificar tabla venta_items para soportar cantidades decimales
ALTER TABLE venta_items 
ALTER COLUMN cantidad TYPE NUMERIC(10, 2);

-- Modificar tabla carrito_items para soportar cantidades decimales
ALTER TABLE carrito_items 
ALTER COLUMN cantidad TYPE NUMERIC(10, 2);

-- Insertar categorías predefinidas de ferretería
INSERT INTO categorias (nombre, descripcion, activo) VALUES
('Iluminación', 'Bombillas LED, tubos, tiras LED, focos, plafones, downlights', true),
('Eléctricos', 'Cables, enchufes, interruptores, tomacorrientes, extensiones', true),
('Herramientas Manuales', 'Alicates, destornilladores, martillos, llaves, sierras', true),
('Herramientas Eléctricas', 'Taladros, amoladoras, sierras eléctricas, lijadoras', true),
('Plomería', 'Tuberías PVC, llaves, grifos, accesorios sanitarios', true),
('Construcción', 'Cemento, arena, ladrillos, perfiles metálicos', true),
('Ferretería General', 'Tornillos, clavos, tuercas, arandelas, pernos, remaches', true),
('Pinturas y Acabados', 'Pinturas, brochas, rodillos, lijas, masillas', true),
('Seguridad', 'Candados, cerraduras, alarmas, detectores de humo', true),
('Jardín y Exterior', 'Mangueras, aspersores, herramientas de jardín', true)
ON CONFLICT DO NOTHING;

-- Crear tabla para configuración de tema (opcional, para persistir preferencia)
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO configuracion_sistema (clave, valor) VALUES
('tema_default', 'light')
ON CONFLICT (clave) DO NOTHING;
