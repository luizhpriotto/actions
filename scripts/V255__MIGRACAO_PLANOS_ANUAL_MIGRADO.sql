-- REMOVIDO script pois o ETL do planos anuais será refeito via ETL e estes já virão na estrutura nova
--do $$
--declare 
--	plano record;
--	periodo record;
--	componente record;
--	objetivo record;
--	existeComponenteCurricular boolean;
--	planejamentoId bigint;
--	periodoEscolarId bigint;
--	planejamentoPeriodoId bigint;
--	planejamentoPeriodoComponenteId bigint;
--	
--begin
--	for plano in 
--		select t.id as turmaId, pa.componente_curricular_eol_id as componenteId
--			, t.ano_letivo as anoLetivo
--			, case t.modalidade_codigo 
--				when 3 then 2
--				when 1 then 3
--				else 1
--			end as modalidadeCalendario
--			, max(pa.criado_em) as criado_em, max(pa.criado_por) as criado_por, max(pa.criado_rf) as criado_rf
--			, max(pa.alterado_em) as alterado_em, max(pa.alterado_por) as alterado_por, max(pa.alterado_rf) as alterado_rf
--		  from plano_anual pa
--		inner join turma t on t.turma_id = pa.turma_id::varchar 
--		 where pa.migrado
--		 group by t.id, pa.componente_curricular_eol_id, t.ano_letivo, t.modalidade_codigo
--		order by t.id, pa.componente_curricular_eol_id
--	loop
--		select 1 into existeComponenteCurricular
--			from componente_curricular
--		   where id = plano.componenteId;
--	
--		if existeComponenteCurricular then
--			/*** Planejamento_Anual ***/
--			insert into planejamento_anual(turma_id, componente_curricular_id, migrado, criado_em, criado_por, criado_rf, alterado_em, alterado_por, alterado_rf)
--			  values (plano.turmaId, plano.componenteId, true, plano.criado_em, plano.criado_por, plano.criado_rf, plano.alterado_em, plano.alterado_por, plano.alterado_rf)
--			RETURNING id INTO planejamentoId;
--
--			-- Busca Periodo escolar
--			for periodo in 
--				select pe.id, pa.descricao, pa.id as planoId
--					 , pa.criado_em, pa.criado_por, pa.criado_rf, pa.alterado_em, pa.alterado_por, pa.alterado_rf
--				  from plano_anual pa 
--				 inner join turma t on t.turma_id = pa.turma_id::varchar 
--				 inner join tipo_calendario tc on tc.ano_letivo = t.ano_letivo
--				 inner join periodo_escolar pe on pe.tipo_calendario_id = tc.id and pe.bimestre = pa.bimestre
--				 where not excluido and situacao
--				   and t.id = plano.turmaId
--				   and pa.componente_curricular_eol_id = plano.componenteId
--				   and tc.modalidade = plano.modalidadeCalendario
--			loop
--				/*** Plenejamento_Anual_Periodo_Escolar ***/
--				insert into planejamento_anual_periodo_escolar (periodo_escolar_id, planejamento_anual_id, criado_em, criado_por, criado_rf, alterado_em, alterado_por, alterado_rf)
--				 values (periodo.id, planejamentoId, periodo.criado_em, periodo.criado_por, periodo.criado_rf, periodo.alterado_em, periodo.alterado_por, periodo.alterado_rf)
--				RETURNING id INTO planejamentoPeriodoId;
--	
--				/*** Planejamento Componente ***/
--				insert into planejamento_anual_componente (planejamento_anual_periodo_escolar_id, componente_curricular_id, descricao, criado_em, criado_por, criado_rf, alterado_em, alterado_por, alterado_rf)
--				  values (planejamentoPeriodoId, plano.componenteId, periodo.descricao, periodo.criado_em, periodo.criado_por, periodo.criado_rf, periodo.alterado_em, periodo.alterado_por, periodo.alterado_rf)
--				RETURNING id INTO planejamentoPeriodoComponenteId;
--
--			end loop; -- periodo
--		
--		end if;
--	end loop; -- plano
--end $$;
