-- Eliminar Estadio y cualquier solicitud que aún lo mencione.
BEGIN;

CREATE TEMP TABLE solicitudes_estadio_eliminar ON COMMIT DROP AS
SELECT DISTINCT sol.id
FROM solicitudes AS sol
LEFT JOIN sedes AS sede ON sede.id = sol.sede_id
LEFT JOIN dependencias AS dep ON dep.id = sol.dependencia_id
WHERE sede.nombre IN ('Sede Estadio', 'Estadio')
  OR dep.sede_id IN (SELECT id FROM sedes WHERE nombre IN ('Sede Estadio', 'Estadio'))
  OR COALESCE(sol.origen, '') ILIKE '%estadio%'
  OR COALESCE(sol.destino, '') ILIKE '%estadio%';

DELETE FROM auditoria
WHERE solicitud_id IN (SELECT id FROM solicitudes_estadio_eliminar);

DELETE FROM solicitudes
WHERE id IN (SELECT id FROM solicitudes_estadio_eliminar);

DELETE FROM dependencias
WHERE sede_id IN (SELECT id FROM sedes WHERE nombre IN ('Sede Estadio', 'Estadio'));

DELETE FROM sedes
WHERE nombre IN ('Sede Estadio', 'Estadio');

UPDATE sedes
SET nombre = TRIM(SUBSTRING(nombre FROM 6))
WHERE nombre LIKE 'Sede %';

COMMIT;
