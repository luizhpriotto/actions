-- Data de criacao: 31/07/2020
-- Descricao: Insere modulo e permissionamento para Di?rio de Bordo

BEGIN TRY
    BEGIN TRAN
	PRINT 'Permissionamento do Di?rio de Bordo - IN?CIO'
	
	--Modulo
	-- insere modulo 57 - Di?rio de Bordo caso nao exista
	IF NOT EXISTS(select * from SYS_Modulo where sis_id = 1000 and mod_id = 57)
	BEGIN
		INSERT INTO SYS_Modulo(sis_id, mod_id, mod_nome, mod_descricao, mod_idPai, mod_auditoria, mod_situacao, mod_dataCriacao, mod_dataAlteracao) VALUES (1000, 57, 'Di?rio de Bordo', NULL, NULL, 0, 1, GETDATE(), GETDATE())
	END
	
	-- insere associacao de modulo 57 - Di?rio de Bordo com visao 2 - Novo SGP
	IF NOT EXISTS(select * from SYS_VisaoModulo where sis_id = 1000 AND mod_id = 57 AND vis_id = 2)
	BEGIN
		INSERT INTO SYS_VisaoModulo(vis_id, sis_id, mod_id) VALUES (2, 1000, 57)
	END

	-- insere associacao de modulo 57 - Di?rio de Bordo com visao 10 - Novo SGP
	IF NOT EXISTS(select * from SYS_VisaoModulo where sis_id = 1000 AND mod_id = 57 AND vis_id = 10)
	BEGIN
		INSERT INTO SYS_VisaoModulo(vis_id, sis_id, mod_id) VALUES (10, 1000, 57)
	END

	-- insere mapeamento de modulo para o modulo 57 - Di?rio de Bordo
	IF NOT EXISTS(select * from SYS_ModuloSiteMap where sis_id = 1000 AND mod_id = 57 AND msm_id = 57)
	BEGIN
		INSERT INTO SYS_ModuloSiteMap(sis_id, mod_id, msm_id, msm_nome, msm_descricao, msm_url, msm_informacoes, msm_urlHelp) VALUES (1000, 57,57, 'Di?rio de Bordo', NULL, '~/', NULL, NULL)
	END


	--Permissoes
	-- insere permiss?o do Di?rio de Bordo para perfil Professor Ed. Infantil
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '60E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('60E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 1, 1, 1)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil Professor CJ Ed. Infantil
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '61E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('61E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 1, 1, 1)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil ADM UE
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '42E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('42E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil CP
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '44E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('44E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil AD
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '45E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('45E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil Diretor
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '46E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('46E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil DRE B?sico
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '47E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('47E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil ADM DRE
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '48E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('48E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil DIPED
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '49E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('49E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil PAAI
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '4AE1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('4AE1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil CEFAI
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '4BE1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('4BE1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil NAAPA
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '4CE1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('4CE1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil Diretor DIPED
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '4DE1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('4DE1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil Supervisor
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '4EE1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('4EE1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil Supervisor Consulta
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '5FE1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('5FE1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil Supervisor T?cnico
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '4FE1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('4FE1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil Diretor Regional
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '50E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('50E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil COPED B?sico
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '51E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('51E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil NTC - NAAPA
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '52E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('52E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil NTC
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '53E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('53E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil NTA
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '54E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('54E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil DIEE
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '55E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('55E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil DIEJA
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '56E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('56E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil DIEI
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '57E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('57E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil DIEFM
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '58E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('58E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil COPED
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '59E1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('59E1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil ADM SME
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '5AE1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('5AE1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 1, 1, 1)
	END

	-- insere permiss?o do Di?rio de Bordo para perfil ADM COTIC
	IF NOT EXISTS(select * from SYS_GrupoPermissao where sis_id = 1000 and mod_id = 57 and gru_id = '5BE1E074-37D6-E911-ABD6-F81654FE895D')
	BEGIN
		INSERT INTO SYS_GrupoPermissao(gru_id, sis_id, mod_id, grp_consultar, grp_inserir, grp_alterar, grp_excluir) VALUES ('5BE1E074-37D6-E911-ABD6-F81654FE895D', 1000, 57, 1, 0, 0, 0)
	END

    PRINT 'Permissionamento do Di?rio de Bordo - FIM'

    COMMIT TRAN
END TRY
BEGIN CATCH
    PRINT 'Erro ao definir permissionamento'
    IF(@@TRANCOUNT > 0)
        ROLLBACK TRAN;
END CATCH
GO