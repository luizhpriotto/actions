--do $$
--declare 
--	pendencia record;
--begin
--	for pendencia in 
--		select a.turma_id as turmaId, a.disciplina_id as componenteId, pa.tipo + 6 as tipo
--			, case pa.tipo
--				when 1 then 'Aula sem Frequência registrada'
--				when 2 then 'Aula sem Plano de Aula registrado'
--				when 3 then 'Aula sem Diario de Bordo registrado'
--				when 4 then 'Aula sem Avaliação registrada'
--			end as titulo
--			, case pa.tipo
--				when 1 then 'As seguintes aulas estão sem Frequência registradas:'
--				when 2 then 'As seguintes aulas estão sem Plano de Aula registrados:'
--				when 3 then 'As seguintes aulas estão sem Diario de Bordo registrados:'
--				when 4 then 'As seguintes aulas estão sem Avaliação registradas:'
--			end as descricao
--		  from pendencia_aula pa
--		 inner join aula a on a.id = pa.aula_id
--		group by a.turma_id, a.disciplina_id, pa.tipo
--	loop
--		CALL INSERIR_PENDENCIA(pendencia.titulo, pendencia.descricao, pendencia.tipo, pendencia_aula.aula_id, pendencia.turmaId, pendencia.componenteId);
--	end loop;
--END; $$;
