CREATE FUNCTION [dbo].[proc_obter_nivel] (@p_cod_servidor as int, @p_cod_ue as varchar(10))
RETURNS @retFuncCargoUe TABLE
(
    NomeServidor varchar(70) NOT NULL,
    CodigoRf varchar(7) NOT NULL,
	DataInicio datetime NULL,
	DataFim datetime NULL,
    Cargo varchar(50) NULL,
	CodigoCargo int null
)
BEGIN
	IF @p_cod_servidor IS NOT NULL AND @p_cod_servidor <> '' AND @p_cod_servidor > 0
		RETURN;
	ELSE
		BEGIN 

			DECLARE @cd_cargo_CP INT = 3379;
			DECLARE @cd_cargo_AD INT = 3085;
			DECLARE @cd_cargo_DIRETOR INT = 3360;
			DECLARE @cd_cargo_SUPERVISOR1 INT = 3352 
			DECLARE @cd_cargo_SUPERVISOR2 INT = 433;
			DECLARE @cd_cargo_CIEJAASSISTPED INT = 42;
			DECLARE @cd_cargo_CIEJAASSISTCOORD INT = 43;
			DECLARE @cd_cargo_CIEJACOORD INT = 44;

			DECLARE @tbFuncCargosUe TABLE
			(
				NomeServidor varchar(70) NOT NULL,
				CodigoRf varchar(7) NOT NULL,
				DataInicio datetime NULL,
				DataFim datetime NULL,
				Cargo varchar(50) NULL,
				CodigoCargo int NULL
			)

			insert into @tbFuncCargosUe
			select NomeServidor,CodigoRf,DataInicio,DataFim,Cargo,CodigoCargo FROM [dbo].[proc_obter_func_cargo_ue](@p_cod_ue);

			IF EXISTS (select 1 from @tbFuncCargosUe where CodigoCargo = @cd_cargo_CP)
			BEGIN
				INSERT INTO @retFuncCargoUe
				SELECT TOP 1 NomeServidor,CodigoRf,DataInicio,DataFim,Cargo,CodigoCargo FROM @tbFuncCargosUe WHERE CodigoCargo = @cd_cargo_CP;
				RETURN;
			END

			IF EXISTS (select 1 from @tbFuncCargosUe where CodigoCargo = @cd_cargo_AD)
			BEGIN
				INSERT INTO @retFuncCargoUe
				SELECT TOP 1 NomeServidor,CodigoRf,DataInicio,DataFim,Cargo,CodigoCargo FROM @tbFuncCargosUe WHERE CodigoCargo = @cd_cargo_AD;
				RETURN;
			END

			IF EXISTS (select 1 from @tbFuncCargosUe where CodigoCargo = @cd_cargo_DIRETOR)
			BEGIN
				INSERT INTO @retFuncCargoUe
				SELECT TOP 1 NomeServidor,CodigoRf,DataInicio,DataFim,Cargo,CodigoCargo FROM @tbFuncCargosUe WHERE CodigoCargo = @cd_cargo_DIRETOR;
				RETURN;
			END

			IF EXISTS (select 1 from @tbFuncCargosUe where CodigoCargo = @cd_cargo_SUPERVISOR1)
			BEGIN
				INSERT INTO @retFuncCargoUe
				SELECT TOP 1 NomeServidor,CodigoRf,DataInicio,DataFim,Cargo,CodigoCargo FROM @tbFuncCargosUe WHERE CodigoCargo = @cd_cargo_SUPERVISOR1;
				RETURN;
			END

			IF EXISTS (select 1 from @tbFuncCargosUe where CodigoCargo = @cd_cargo_SUPERVISOR2)
			BEGIN
				INSERT INTO @retFuncCargoUe
				SELECT TOP 1 NomeServidor,CodigoRf,DataInicio,DataFim,Cargo,CodigoCargo FROM @tbFuncCargosUe WHERE CodigoCargo = @cd_cargo_SUPERVISOR2;
				RETURN;
			END

			DECLARE @tbFuncFuncaoUe TABLE
			(
				NomeServidor varchar(70) NOT NULL,
				CodigoRf varchar(7) NOT NULL,
				DataInicio datetime NULL,
				DataFim datetime NULL,
				CdTipoFuncao int NULL
			)

			insert into @tbFuncFuncaoUe
			select NomeServidor,CodigoRf,DataInicio,DataFim,CdTipoFuncao FROM [dbo].[proc_obter_func_funcao_ue](@p_cod_ue);

			IF EXISTS (select 1 from @tbFuncFuncaoUe where CdTipoFuncao = @cd_cargo_CIEJAASSISTPED)
			BEGIN
				INSERT INTO @retFuncCargoUe
				SELECT TOP 1 NomeServidor,CodigoRf,DataInicio,DataFim,null,CdTipoFuncao FROM @tbFuncFuncaoUe WHERE CdTipoFuncao = @cd_cargo_CIEJAASSISTPED;
				RETURN;
			END

			IF EXISTS (select 1 from @tbFuncFuncaoUe where CdTipoFuncao = @cd_cargo_CIEJAASSISTCOORD)
			BEGIN
				INSERT INTO @retFuncCargoUe
				SELECT TOP 1 NomeServidor,CodigoRf,DataInicio,DataFim,null,CdTipoFuncao FROM @tbFuncFuncaoUe WHERE CdTipoFuncao = @cd_cargo_CIEJAASSISTCOORD;
				RETURN;
			END

			IF EXISTS (select 1 from @tbFuncFuncaoUe where CdTipoFuncao = @cd_cargo_CIEJACOORD)
			BEGIN
				INSERT INTO @retFuncCargoUe
				SELECT TOP 1 NomeServidor,CodigoRf,DataInicio,DataFim,null,CdTipoFuncao FROM @tbFuncFuncaoUe WHERE CdTipoFuncao = @cd_cargo_CIEJACOORD;
				RETURN;
			END
			
		END

	RETURN
END