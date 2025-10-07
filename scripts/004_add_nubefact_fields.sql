-- Agregar campos para facturación electrónica con Nubefact
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_comprobante VARCHAR(20) DEFAULT 'boleta';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS numero_comprobante VARCHAR(50);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS serie_comprobante VARCHAR(10);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS nubefact_enlace TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS nubefact_pdf TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS nubefact_xml TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS nubefact_cdr TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS nubefact_response JSONB;

-- Agregar campos de cliente para facturación
ALTER TABLE invitados ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(20) DEFAULT 'DNI';
ALTER TABLE invitados ADD COLUMN IF NOT EXISTS numero_documento VARCHAR(20);
ALTER TABLE invitados ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE invitados ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE invitados ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

COMMENT ON COLUMN ventas.tipo_comprobante IS 'Tipo de comprobante: boleta, factura, nota_credito, nota_debito';
COMMENT ON COLUMN ventas.numero_comprobante IS 'Número del comprobante generado';
COMMENT ON COLUMN ventas.serie_comprobante IS 'Serie del comprobante';
COMMENT ON COLUMN ventas.nubefact_enlace IS 'URL del comprobante en Nubefact';
COMMENT ON COLUMN ventas.nubefact_pdf IS 'URL del PDF generado';
COMMENT ON COLUMN ventas.nubefact_xml IS 'URL del XML generado';
COMMENT ON COLUMN ventas.nubefact_cdr IS 'URL del CDR de SUNAT';
