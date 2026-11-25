-- ============================================================
-- MIGRACIÓN 001 — Esquema inicial del Sistema de Transporte
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Tabla de sedes
CREATE TABLE IF NOT EXISTS sedes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de dependencias (asociadas a sede)
CREATE TABLE IF NOT EXISTS dependencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  activa BOOLEAN DEFAULT true
);

-- Tabla de vehículos corporativos
CREATE TABLE IF NOT EXISTS vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('camion', 'van', 'moto', 'sedan', 'pickup')),
  disponible BOOLEAN DEFAULT true
);

-- Tipos ENUM para el workflow
CREATE TYPE estado_solicitud AS ENUM (
  'RECIBIDO', 'EN_PROCESO', 'EN_CAMINO', 'COMPLETADO', 'CANCELADO'
);

CREATE TYPE tipo_solicitud AS ENUM (
  'TRANSPORTE_GENERAL',
  'MOVILIZACION_PERSONAL',
  'CARGA_BIOLOGICA',
  'DEVOLUCION_ACTIVOS'
);

-- Tabla principal de solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Datos del solicitante (desde perfil SSO)
  solicitante_id UUID NOT NULL REFERENCES auth.users(id),
  solicitante_nombre TEXT NOT NULL,
  solicitante_cargo TEXT NOT NULL,
  solicitante_email TEXT NOT NULL,
  sede_id UUID NOT NULL REFERENCES sedes(id),
  dependencia_id UUID NOT NULL REFERENCES dependencias(id),

  -- Datos del servicio
  tipo tipo_solicitud NOT NULL,
  insumos TEXT,
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  fecha_gestion DATE NOT NULL,
  observaciones_solicitante TEXT,

  -- Módulo condicional: Pasajeros (solo MOVILIZACION_PERSONAL)
  pasajero_nombre TEXT,
  pasajero_celular TEXT,
  pasajero_motivo TEXT,
  pasajero_centro_costos TEXT,

  -- Módulo condicional: Cadena de frío (solo CARGA_BIOLOGICA)
  hora_en_sede TIME,
  hora_en_cava TIME,

  -- Módulo condicional: Colaborador retirado (solo DEVOLUCION_ACTIVOS)
  retirado_nombre TEXT,
  retirado_area TEXT,
  retirado_cargo TEXT,

  -- Gestión Logística (solo admin/coordinador)
  vehiculo_id UUID REFERENCES vehiculos(id),
  conductor_id UUID REFERENCES auth.users(id),
  estado estado_solicitud DEFAULT 'RECIBIDO',
  prioridad_sugerida INT CHECK (prioridad_sugerida BETWEEN 1 AND 10),
  prioridad_manual INT CHECK (prioridad_manual BETWEEN 1 AND 10),
  notas_logistica TEXT,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de adjuntos
CREATE TABLE IF NOT EXISTS adjuntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('imagen', 'acta')),
  subido_por UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bitácora de auditoría (inmutable)
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID NOT NULL REFERENCES solicitudes(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  estado_anterior estado_solicitud,
  estado_nuevo estado_solicitud NOT NULL,
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER solicitudes_updated_at
  BEFORE UPDATE ON solicitudes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Solicitante: solo ve y edita sus propias solicitudes
CREATE POLICY "solicitante_select_sus" ON solicitudes
  FOR SELECT USING (solicitante_id = auth.uid());

CREATE POLICY "solicitante_insert" ON solicitudes
  FOR INSERT WITH CHECK (solicitante_id = auth.uid());

-- Admin / Coordinador: acceso total
CREATE POLICY "admin_all" ON solicitudes
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'coordinador')
  );

-- Conductor: solo ve sus asignaciones
CREATE POLICY "conductor_select" ON solicitudes
  FOR SELECT USING (
    conductor_id = auth.uid() OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'coordinador')
  );

-- Adjuntos: visibles para solicitante, coordinador y conductor asignado
CREATE POLICY "adjuntos_select" ON adjuntos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM solicitudes s
      WHERE s.id = adjuntos.solicitud_id
      AND (
        s.solicitante_id = auth.uid() OR
        s.conductor_id = auth.uid() OR
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'coordinador')
      )
    )
  );

-- ============================================================
-- DATOS SEMILLA (SEED) — Ajustar a la organización real
-- ============================================================
INSERT INTO sedes (nombre) VALUES
  ('Administrativa'),
  ('Centro'),
  ('Norte')
ON CONFLICT DO NOTHING;

INSERT INTO dependencias (nombre, sede_id) 
SELECT d.nombre, s.id FROM (VALUES
  ('Financiera',       'Administrativa'),
  ('Recursos Humanos', 'Administrativa'),
  ('Logística',        'Administrativa'),
  ('Farmacia',         'Centro'),
  ('Urgencias',        'Centro'),
  ('Consulta Externa', 'Centro')
) AS d(nombre, sede_nombre)
JOIN sedes s ON s.nombre = d.sede_nombre
ON CONFLICT DO NOTHING;

INSERT INTO vehiculos (placa, tipo) VALUES
  ('ABC-123', 'van'),
  ('DEF-456', 'camion'),
  ('GHI-789', 'sedan'),
  ('JKL-012', 'moto'),
  ('MNO-345', 'pickup')
ON CONFLICT DO NOTHING;
