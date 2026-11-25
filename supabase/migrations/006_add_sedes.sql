-- Agregar sedes nuevas sin dependencias asociadas.
INSERT INTO sedes (id, nombre, activa) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'Argentina Tb', true),
  ('a1000000-0000-0000-0000-000000000006', 'Av. Oriental', true),
  ('a1000000-0000-0000-0000-000000000007', 'Av. Oriental Barbacoas', true),
  ('a1000000-0000-0000-0000-000000000008', 'Calasanz', true),
  ('a1000000-0000-0000-0000-000000000009', 'C. Especialistas', true),
  ('a1000000-0000-0000-0000-00000000000a', 'Norte Alterna', true),
  ('a1000000-0000-0000-0000-00000000000b', 'Suramericana', true),
  ('a1000000-0000-0000-0000-00000000000c', 'Spazio', true),
  ('a1000000-0000-0000-0000-00000000000d', 'Otra', true)
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    activa = EXCLUDED.activa;
