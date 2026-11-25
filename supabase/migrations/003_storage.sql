-- ============================================================
-- MIGRACIÓN 003 — Configuración de Storage para adjuntos
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Crear bucket privado para adjuntos de solicitudes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adjuntos-solicitudes',
  'adjuntos-solicitudes',
  false,
  10485760,  -- 10 MB máximo por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Solicitante puede subir archivos a su propia solicitud
CREATE POLICY "upload_adjunto_solicitante"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'adjuntos-solicitudes' AND
  auth.uid() IS NOT NULL
);

-- Policy: Ver adjuntos — solicitante, coordinador y conductor asignado
CREATE POLICY "view_adjunto"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'adjuntos-solicitudes' AND
  auth.uid() IS NOT NULL
);

-- Policy: Admin puede eliminar adjuntos
CREATE POLICY "delete_adjunto_admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'adjuntos-solicitudes' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'coordinador')
);
