do $$
declare 
	pendencia record;
	pendenciaId bigint;
begin
	for pendencia in 
		select a.turma_id as turmaId, a.disciplina_id as componenteId, pa.tipo + 6 as tipo
			, case pa.tipo
				when 1 then 'Aula sem Frequência registrada'
				when 2 then 'Aula sem Plano de Aula registrado'
				when 3 then 'Aula sem Diario de Bordo registrado'
				when 4 then 'Aula sem Avaliação registrada'
			end as titulo
			, case pa.tipo
				when 1 then 'As seguintes aulas estão sem Frequência registradas:'
				when 2 then 'As seguintes aulas estão sem Plano de Aula registrados:'
				when 3 then 'As seguintes aulas estão sem Diario de Bordo registrados:'
				when 4 then 'As seguintes aulas estão sem Avaliação registradas:'
			end as descricao
		  from pendencia_aula pa
		 inner join aula a on a.id = pa.aula_id
		group by a.turma_id, a.disciplina_id, pa.tipo
	loop
	    insert into pendencia(titulo, descricao, situacao, tipo, excluido, migrado, criado_em, criado_por, criado_rf, alterado_em, alterado_por, alterado_rf)
			  values (pendencia.titulo, pendencia.descricao, 1, pendencia.tipo, false, false, NOW(), 'SISTEMA', 'SISTEMA', null, '', '')
			RETURNING id INTO pendenciaId;
	
		 update pendencia_aula
		        set pendencia_id = pendenciaId
		  from aula 
		  where aula.id = pendencia_aula.aula_id
		    and aula.turma_id = pendencia.turmaId
		    and aula.disciplina_id = pendencia.componenteId;

	end loop;
END; $$;
