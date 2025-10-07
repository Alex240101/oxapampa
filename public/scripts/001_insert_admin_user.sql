-- Insertar usuario administrador si no existe
INSERT INTO administradores (id, usuario, password, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin123',
  now(),
  now()
)
ON CONFLICT (usuario) DO NOTHING;
