BEGIN;

ALTER TABLE Evaluacion
  ADD COLUMN IF NOT EXISTS observaciones TEXT;

UPDATE Evaluacion
SET resultado_general = COALESCE(NULLIF(resultado_general, ''), NULLIF(resultado, ''))
WHERE resultado IS NOT NULL;

COMMIT;
