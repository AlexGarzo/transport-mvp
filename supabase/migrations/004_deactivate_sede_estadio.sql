-- Desactivar Sede Estadio sin eliminar sedes ni dependencias asociadas a solicitudes históricas.
UPDATE sedes
SET activa = false
WHERE nombre = 'Sede Estadio'
  AND activa = true;

UPDATE dependencias AS d
SET activa = false
FROM sedes AS s
WHERE d.sede_id = s.id
  AND s.nombre = 'Sede Estadio'
  AND d.activa = true;
