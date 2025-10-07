-- Agregar campos para soportar más tipos de comprobantes electrónicos
-- Guías de remisión, notas de crédito/débito, retenciones y percepciones

-- Agregar columnas adicionales a la tabla ventas para soportar todos los tipos de comprobantes
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_comprobante VARCHAR(50) DEFAULT 'Boleta';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS serie_comprobante VARCHAR(10);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS numero_comprobante INTEGER;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS motivo_nota TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS comprobante_referencia_id UUID;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_nota VARCHAR(20);

-- Crear tabla para guías de remisión
CREATE TABLE IF NOT EXISTS guias_remision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serie VARCHAR(10) NOT NULL,
  numero INTEGER NOT NULL,
  fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_traslado DATE NOT NULL,
  
  -- Datos del remitente
  remitente_ruc VARCHAR(11) NOT NULL,
  remitente_razon_social VARCHAR(255) NOT NULL,
  remitente_direccion TEXT NOT NULL,
  
  -- Datos del destinatario
  destinatario_tipo_doc VARCHAR(10) NOT NULL,
  destinatario_numero_doc VARCHAR(20) NOT NULL,
  destinatario_razon_social VARCHAR(255) NOT NULL,
  destinatario_direccion TEXT NOT NULL,
  
  -- Datos del traslado
  motivo_traslado VARCHAR(50) NOT NULL,
  modalidad_traslado VARCHAR(50) NOT NULL,
  peso_total DECIMAL(10,2),
  numero_bultos INTEGER,
  
  -- Datos del transportista (si aplica)
  transportista_tipo_doc VARCHAR(10),
  transportista_numero_doc VARCHAR(20),
  transportista_razon_social VARCHAR(255),
  transportista_placa VARCHAR(20),
  
  -- Punto de partida y llegada
  punto_partida TEXT NOT NULL,
  punto_llegada TEXT NOT NULL,
  
  -- Datos de Nubefact
  nubefact_enlace_pdf TEXT,
  nubefact_enlace_xml TEXT,
  nubefact_enlace_cdr TEXT,
  nubefact_codigo_hash TEXT,
  nubefact_codigo_qr TEXT,
  nubefact_aceptada_por_sunat BOOLEAN DEFAULT FALSE,
  nubefact_errores TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para items de guías de remisión
CREATE TABLE IF NOT EXISTS guia_remision_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guia_remision_id UUID REFERENCES guias_remision(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  descripcion TEXT NOT NULL,
  unidad_medida VARCHAR(50) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  codigo_producto VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_guias_remision_fecha ON guias_remision(fecha_emision DESC);
CREATE INDEX IF NOT EXISTS idx_guias_remision_serie_numero ON guias_remision(serie, numero);
CREATE INDEX IF NOT EXISTS idx_guia_remision_items_guia ON guia_remision_items(guia_remision_id);

-- Comentarios
COMMENT ON TABLE guias_remision IS 'Guías de remisión electrónicas emitidas';
COMMENT ON TABLE guia_remision_items IS 'Items/productos de las guías de remisión';
COMMENT ON COLUMN ventas.tipo_comprobante IS 'Tipo: Factura, Boleta, Nota de Crédito, Nota de Débito, Retención, Percepción';
COMMENT ON COLUMN ventas.motivo_nota IS 'Motivo de la nota de crédito o débito';
COMMENT ON COLUMN ventas.comprobante_referencia_id IS 'ID del comprobante al que hace referencia la nota';
