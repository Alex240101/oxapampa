-- Agregar campos profesionales a la tabla productos
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(100),
ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(50) DEFAULT 'Unidad',
ADD COLUMN IF NOT EXISTS proveedor VARCHAR(255),
ADD COLUMN IF NOT EXISTS precio_compra DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS ubicacion_almacen VARCHAR(100),
ADD COLUMN IF NOT EXISTS marca VARCHAR(100),
ADD COLUMN IF NOT EXISTS modelo VARCHAR(100);

-- Crear tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  ruc VARCHAR(11),
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  contacto VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Crear tabla de métodos de pago
CREATE TABLE IF NOT EXISTS metodos_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Insertar métodos de pago por defecto
INSERT INTO metodos_pago (nombre) VALUES
('Efectivo'),
('Tarjeta de Débito'),
('Tarjeta de Crédito'),
('Transferencia Bancaria'),
('Yape'),
('Plin')
ON CONFLICT DO NOTHING;

-- Agregar campos adicionales a ventas
ALTER TABLE ventas
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(100) DEFAULT 'Efectivo',
ADD COLUMN IF NOT EXISTS descuento DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS igv DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS cliente_documento VARCHAR(20),
ADD COLUMN IF NOT EXISTS notas TEXT;

-- Insertar categorías profesionales de ferretería
INSERT INTO categorias (nombre, descripcion) VALUES
('Iluminación LED', 'Bombillas LED, tubos LED, tiras LED, downlights, paneles LED'),
('Iluminación Decorativa', 'Lámparas decorativas, apliques, plafones, focos direccionales'),
('Accesorios de Iluminación', 'Portalámparas, drivers, transformadores, conectores, perfiles'),
('Herramientas Manuales', 'Alicates, destornilladores, martillos, llaves, sierras'),
('Herramientas Eléctricas', 'Taladros, amoladoras, lijadoras, sierras eléctricas'),
('Material Eléctrico', 'Cables, enchufes, interruptores, cajas de conexión, canaletas'),
('Ferretería General', 'Tornillos, clavos, tuercas, arandelas, tacos, remaches'),
('Construcción', 'Cemento, arena, ladrillos, tubos PVC, accesorios de construcción'),
('Pintura y Acabados', 'Pinturas, brochas, rodillos, lijas, masillas'),
('Seguridad', 'Candados, cerraduras, alarmas, detectores de humo')
ON CONFLICT DO NOTHING;
