BEGIN;

ALTER TABLE Evaluacion
  ADD COLUMN IF NOT EXISTS observaciones TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'evaluacion'
      AND column_name = 'resultado'
  ) THEN
    EXECUTE '
      UPDATE Evaluacion
      SET resultado_general = COALESCE(NULLIF(resultado_general, ''''), NULLIF(resultado, ''''))
      WHERE resultado IS NOT NULL
    ';
  END IF;
END $$;

COMMIT;
