ALTER TABLE IF EXISTS notas_conceito ALTER COLUMN NOTA type NUMERIC(5,2);

UPDATE NOTAS_PARAMETROS SET INICIO_VIGENCIA = '2019-01-01';

UPDATE NOTAS_CONCEITOS_CICLOS_PARAMETOS SET INICIO_VIGENCIA = '2019-01-01';