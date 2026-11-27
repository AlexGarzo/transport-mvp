-- Corrige el nombre de la sede cuando quedó guardado como "Espacio".
UPDATE sedes
SET nombre = 'Spazio'
WHERE LOWER(TRIM(nombre)) = 'espacio';
