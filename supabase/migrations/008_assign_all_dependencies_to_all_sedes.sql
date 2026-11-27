-- Asigna el listado completo de dependencias a todas las sedes.
UPDATE dependencias
SET activa = false
WHERE nombre IN ('Urgencias', 'Consulta Externa', 'Almacén', 'Logística');

INSERT INTO dependencias (nombre, sede_id, activa)
SELECT
  dependencias.nombre,
  sedes.id,
  true
FROM sedes
CROSS JOIN (
  VALUES
    ('Farmacia'),
    ('Financiera'),
    ('Gerencia General'),
    ('Laboratorio Clínico'),
    ('Mantenimiento'),
    ('Recursos Humanos'),
    ('Sistemas / TI'),
    ('Vacunación')
) AS dependencias(nombre)
WHERE NOT EXISTS (
  SELECT 1
  FROM dependencias AS existente
  WHERE existente.sede_id = sedes.id
    AND existente.nombre = dependencias.nombre
);
