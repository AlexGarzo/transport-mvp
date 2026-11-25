-- ============================================================
-- SEED — Datos iniciales del sistema
-- Ejecutar DESPUÉS de 001_initial_schema.sql
-- ============================================================

-- Sedes de la organización (ajustar según la organización real)
INSERT INTO sedes (id, nombre, activa) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Administrativa', true),
  ('a1000000-0000-0000-0000-000000000002', 'Centro',         true),
  ('a1000000-0000-0000-0000-000000000004', 'Norte',          true)
ON CONFLICT (id) DO NOTHING;

-- Dependencias por sede
INSERT INTO dependencias (nombre, sede_id) VALUES
  -- Sede Administrativa
  ('Financiera',           'a1000000-0000-0000-0000-000000000001'),
  ('Recursos Humanos',     'a1000000-0000-0000-0000-000000000001'),
  ('Logística',            'a1000000-0000-0000-0000-000000000001'),
  ('Sistemas / TI',        'a1000000-0000-0000-0000-000000000001'),
  ('Gerencia General',     'a1000000-0000-0000-0000-000000000001'),
  -- Sede Centro
  ('Farmacia',             'a1000000-0000-0000-0000-000000000002'),
  ('Urgencias',            'a1000000-0000-0000-0000-000000000002'),
  ('Consulta Externa',     'a1000000-0000-0000-0000-000000000002'),
  ('Laboratorio Clínico',  'a1000000-0000-0000-0000-000000000002'),
  ('Vacunación',           'a1000000-0000-0000-0000-000000000002'),
  -- Sede Norte
  ('Almacén',              'a1000000-0000-0000-0000-000000000004'),
  ('Mantenimiento',        'a1000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- Vehículos corporativos (ajustar placas reales)
INSERT INTO vehiculos (placa, tipo, disponible) VALUES
  ('ABC-123', 'van',    true),
  ('DEF-456', 'camion', true),
  ('GHI-789', 'sedan',  true),
  ('JKL-012', 'moto',   true),
  ('MNO-345', 'pickup', true)
ON CONFLICT (placa) DO NOTHING;
