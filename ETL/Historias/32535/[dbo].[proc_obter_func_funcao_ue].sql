ALTER FUNCTION [dbo].[proc_obter_func_funcao_ue] (@p_cod_ue as varchar(10))
RETURNS @retFuncFuncaoUe TABLE
(
    NomeServidor varchar(70) NOT NULL,
    CodigoRf varchar(7) NOT NULL,
	DataInicio datetime NULL,
	DataFim datetime NULL,
    CdTipoFuncao int NULL
)
AS
BEGIN
WITH FFUE_cte(NomeServidor, CodigoRf, DataInicio, DataFim, CdTipoFuncao)
    AS (
		SELECT DISTINCT	 
					servidor.nm_pessoa as NomeServidor,
					servidor.cd_registro_funcional as CodigoRf,
	                cargobase.dt_posse           DataInicio, 
			        cargobase.dt_fim_nomeacao    DataFim,
					funcao.cd_tipo_funcao CdTipoFuncao
                FROM v_servidor_cotic servidor
                INNER JOIN v_cargo_base_cotic cargobase ON servidor.cd_servidor = cargobase.cd_servidor
                INNER JOIN funcao_atividade_cargo_servidor funcao ON cargobase.cd_cargo_base_servidor = funcao.cd_cargo_base_servidor
                INNER JOIN v_cadastro_unidade_educacao ue ON funcao.cd_unidade_local_servico = ue.cd_unidade_educacao
                INNER JOIN v_cadastro_unidade_educacao dre ON dre.cd_unidade_educacao = ue.cd_unidade_administrativa_referencia
                INNER JOIN escola ON ue.cd_unidade_educacao = escola.cd_escola
                INNER JOIN tipo_unidade_educacao tue ON ue.tp_unidade_educacao  = tue.tp_unidade_educacao
                INNER JOIN tipo_escola ON escola.tp_escola = tipo_escola.tp_escola
                INNER JOIN unidade_administrativa 
	                ON ue.cd_unidade_administrativa_referencia = 
					                unidade_administrativa.cd_unidade_administrativa 
		                AND tp_unidade_administrativa = 24 
                WHERE funcao.dt_fim_funcao_atividade IS NULL
	                AND cargobase.dt_cancelamento IS NULL 
	                AND cargobase.dt_fim_nomeacao IS NULL
	                AND escola.tp_escola IN (13)
					AND funcao.cd_tipo_funcao in (42,43,44)
					AND escola.cd_escola = @p_cod_ue
			   )
-- copy the required columns to the result of the function
    INSERT @retFuncFuncaoUe
    SELECT  NomeServidor, CodigoRF, DataInicio, DataFim, CdTipoFuncao
    FROM FFUE_cte
    RETURN
END;