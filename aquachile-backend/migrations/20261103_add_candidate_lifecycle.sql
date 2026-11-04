BEGIN;

ALTER TABLE Candidato
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'En consideración',
  ADD COLUMN IF NOT EXISTS fecha_cierre DATE;

WITH ultima_evaluacion AS (
  SELECT DISTINCT ON (s.Candidato_id)
         s.Candidato_id,
         e.resultado_general,
         e.fecha_evaluacion
  FROM Solicitud s
  INNER JOIN Evaluacion e ON e.Solicitud_id = s.id
  ORDER BY s.Candidato_id, e.fecha_evaluacion DESC, e.id DESC
)
UPDATE Candidato c
SET estado = CASE
               WHEN ue.resultado_general = 'Rechazado' THEN 'Reprobado'
               ELSE 'Aprobado'
             END,
    fecha_cierre = CASE
                     WHEN ue.resultado_general = 'Rechazado' THEN ue.fecha_evaluacion
                     ELSE NULL
                   END
FROM ultima_evaluacion ue
WHERE ue.Candidato_id = c.id
  AND ue.resultado_general IN ('Aprobado', 'Rechazado');

COMMIT;
