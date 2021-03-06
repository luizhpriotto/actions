using Dapper;
using SME.SGP.Dominio;
using SME.SGP.Dominio.Entidades;
using SME.SGP.Dominio.Interfaces;
using SME.SGP.Infra;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace SME.SGP.Dados.Repositorios
{
    public class RepositorioConselhoClasse : RepositorioBase<ConselhoClasse>, IRepositorioConselhoClasse
    {
        public RepositorioConselhoClasse(ISgpContext database) : base(database)
        {
        }

        public async Task<ConselhoClasse> ObterPorFechamentoId(long fechamentoTurmaId)
        {
            var query = @"select c.* 
                            from conselho_classe c 
                           where c.fechamento_turma_id = @fechamentoTurmaId";

            return await database.Conexao.QueryFirstOrDefaultAsync<ConselhoClasse>(query, new { fechamentoTurmaId });
        }

        public async Task<IEnumerable<long>> ObterConselhoClasseIdsPorTurmaEPeriodoAsync(string[] turmasCodigos, long? periodoEscolarId = null)
        {
            var query = new StringBuilder(@"select c.id 
                            from conselho_classe c 
                            inner join fechamento_turma ft on ft.id = c.fechamento_turma_id
                            inner join turma t on t.id = ft.turma_id
                            where t.turma_id = ANY(@turmasCodigos) ");

            if (periodoEscolarId.HasValue)
                query.AppendLine("and ft.periodo_escolar_id = @periodoEscolarId");
            else
                query.AppendLine("and ft.periodo_escolar_id is null");

            return await database.Conexao.QueryAsync<long>(query.ToString(), new { turmasCodigos, periodoEscolarId });
        }

        public async Task<ConselhoClasse> ObterPorTurmaEPeriodoAsync(long turmaId, long? periodoEscolarId = null)
        {
            var query = new StringBuilder(@"select c.* 
                            from conselho_classe c 
                           inner join fechamento_turma t on t.id = c.fechamento_turma_id
                           where t.turma_id = @turmaId ");

            if (periodoEscolarId.HasValue)
                query.AppendLine(" and t.periodo_escolar_id = @periodoEscolarId");
            else
                query.AppendLine(" and t.periodo_escolar_id is null");

            return await database.Conexao.QueryFirstOrDefaultAsync<ConselhoClasse>(query.ToString(), new { turmaId, periodoEscolarId });
        }

        public async Task<IEnumerable<BimestreComConselhoClasseTurmaDto>> ObterimestreComConselhoClasseTurmaAsync(long turmaId)
        {
            var query = new StringBuilder(@"select   	   
                                               min(cc.id) as conselhoClasseId,
                                               cc.fechamento_turma_id as fechamentoTurmaId,
                                               coalesce(pe.bimestre, 0) as bimestre
                                          from fechamento_turma ft 
                                          inner join conselho_classe cc on
                                           ft.id = cc.fechamento_turma_id 
                                          left join periodo_escolar pe on 
                                           ft.periodo_escolar_id = pe.id  
                                          where ft.turma_id = @turmaId 
                                        group by ft.turma_id,cc.fechamento_turma_id, pe.bimestre
                                        order by pe.bimestre ");
            return await database.Conexao.QueryAsync<BimestreComConselhoClasseTurmaDto>(query.ToString(), new { turmaId });
        }

        public async Task<string> ObterTurmaCodigoPorConselhoClasseId(long conselhoClasseId)
        {
            var query = @"select t.turma_id
                          from conselho_classe cc
                          inner join fechamento_turma ft on ft.id = cc.fechamento_turma_id
                          inner join turma t on t.id = ft.turma_id
                         where not cc.excluido and not ft.excluido
                           and cc.id = @conselhoClasseId";

            return await database.Conexao.QueryFirstOrDefaultAsync<string>(query, new { conselhoClasseId });
        }

        public async Task<IEnumerable<string>> ObterAlunosComNotaLancadaPorConselhoClasseId(long conselhoClasseId)
        {
            var query = @"select distinct cca.aluno_codigo
                          from conselho_classe_aluno cca
                          inner join conselho_classe_nota ccn on ccn.conselho_classe_aluno_id = cca.id
                         where not cca.excluido
                           and cca.conselho_classe_id = @conselhoClasseId";

            return await database.Conexao.QueryAsync<string>(query, new { conselhoClasseId });
        }

        public Task<bool> AtualizarSituacao(long conselhoClasseId, SituacaoConselhoClasse situacaoConselhoClasse)
        {
            database.Conexao.Execute("update conselho_classe set situacao = @situacaoConselhoClasse where id = @conselhoClasseId", new { conselhoClasseId, situacaoConselhoClasse = (int)situacaoConselhoClasse });

            return Task.FromResult(true);
        }

        public async Task<SituacaoConselhoClasse> ObterSituacaoConselhoClasse(long turmaId, long periodoEscolarId)
        {
            var query = @"select cc.situacao
                        from conselho_classe cc
                       inner join fechamento_turma ft on ft.id = cc.fechamento_turma_id
                       where ft.turma_id = @turmaId
                        and ft.periodo_escolar_id = @periodoEscolarId";

            return (SituacaoConselhoClasse)await database.Conexao.QueryFirstOrDefaultAsync<int>(query, new { turmaId, periodoEscolarId });
        }
    }
}