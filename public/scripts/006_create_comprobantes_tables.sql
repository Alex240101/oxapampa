-- Tabla para notas de crédito y débito
CREATE TABLE IF NOT EXISTS notas_credito_debito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('credito', 'debito')),
  comprobante_original_id UUID REFERENCES ventas(id),
  serie_comprobante VARCHAR(10),
  numero_comprobante VARCHAR(20),
  motivo VARCHAR(2),
  motivo_descripcion TEXT,
  cliente_nombre VARCHAR(255),
  cliente_tipo_documento VARCHAR(20),
  cliente_numero_documento VARCHAR(20),
  total DECIMAL(10, 2),
  nubefact_enlace TEXT,
  nubefact_pdf TEXT,
  nubefact_xml TEXT,
  nubefact_cdr TEXT,
  nubefact_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para retenciones
CREATE TABLE IF NOT EXISTS retenciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serie_comprobante VARCHAR(10) DEFAULT 'RRR1',
  numero_comprobante VARCHAR(20),
  proveedor_ruc VARCHAR(11) NOT NULL,
  proveedor_nombre VARCHAR(255) NOT NULL,
  proveedor_direccion TEXT,
  fecha_emision DATE NOT NULL,
  total_retenido DECIMAL(10, 2) NOT NULL,
  observaciones TEXT,
  nubefact_enlace TEXT,
  nubefact_pdf TEXT,
  nubefact_xml TEXT,
  nubefact_cdr TEXT,
  nubefact_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para percepciones
CREATE TABLE IF NOT EXISTS percepciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serie_comprobante VARCHAR(10) DEFAULT 'PPP1',
  numero_comprobante VARCHAR(20),
  cliente_tipo_documento VARCHAR(20) NOT NULL,
  cliente_numero_documento VARCHAR(20) NOT NULL,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_direccion TEXT,
  fecha_emision DATE NOT NULL,
  total_percibido DECIMAL(10, 2) NOT NULL,
  observaciones TEXT,
  nubefact_enlace TEXT,
  nubefact_pdf TEXT,
  nubefact_xml TEXT,
  nubefact_cdr TEXT,
  nubefact_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notas_tipo ON notas_credito_debito(tipo);
CREATE INDEX IF NOT EXISTS idx_notas_comprobante ON notas_credito_debito(serie_comprobante, numero_comprobante);
CREATE INDEX IF NOT EXISTS idx_retenciones_comprobante ON retenciones(serie_comprobante, numero_comprobante);
CREATE INDEX IF NOT EXISTS idx_percepciones_comprobante ON percepciones(serie_comprobante, numero_comprobante);
