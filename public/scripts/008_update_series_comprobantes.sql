-- Actualizar las series de los comprobantes electrónicos a "0001"

-- Actualizar serie por defecto para retenciones
ALTER TABLE retenciones ALTER COLUMN serie_comprobante SET DEFAULT '0001';

-- Actualizar serie por defecto para percepciones
ALTER TABLE percepciones ALTER COLUMN serie_comprobante SET DEFAULT '0001';

-- Actualizar serie por defecto para notas de crédito y débito
ALTER TABLE notas_credito_debito ALTER COLUMN serie_comprobante SET DEFAULT '0001';

-- Actualizar registros existentes (si los hay)
UPDATE retenciones SET serie_comprobante = '0001' WHERE serie_comprobante IS NULL OR serie_comprobante = 'RRR1';
UPDATE percepciones SET serie_comprobante = '0001' WHERE serie_comprobante IS NULL OR serie_comprobante = 'PPP1';
UPDATE notas_credito_debito SET serie_comprobante = '0001' WHERE serie_comprobante IS NULL;

-- Comentarios para documentación
COMMENT ON COLUMN retenciones.serie_comprobante IS 'Serie del comprobante de retención (por defecto: 0001)';
COMMENT ON COLUMN percepciones.serie_comprobante IS 'Serie del comprobante de percepción (por defecto: 0001)';
COMMENT ON COLUMN notas_credito_debito.serie_comprobante IS 'Serie del comprobante de nota de crédito/débito (por defecto: 0001)';
