﻿using SME.SGP.Infra;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SME.SGP.Dominio.Interfaces
{
    public interface IRepositorioConselhoClasse : IRepositorioBase<ConselhoClasse>
    {
        Task<ConselhoClasse> ObterPorTurmaEPeriodoAsync(long turmaId, long? periodoEscolarId = null);
        Task<IEnumerable<long>> ObterConselhoClasseIdsPorTurmaEPeriodoAsync(string[] turmasCodigos, long? periodoEscolarId = null);
        Task<ConselhoClasse> ObterPorFechamentoId(long fechamentoTurmaId);
        Task<IEnumerable<BimestreComConselhoClasseTurmaDto>> ObterimestreComConselhoClasseTurmaAsync(long turmaId);
        Task<string> ObterTurmaCodigoPorConselhoClasseId(long conselhoClasseId);
        Task<IEnumerable<string>> ObterAlunosComNotaLancadaPorConselhoClasseId(long conselhoClasseId);
        Task<bool> AtualizarSituacao(long conselhoClasseId, SituacaoConselhoClasse situacaoConselhoClasse);
        Task<SituacaoConselhoClasse> ObterSituacaoConselhoClasse(long turmaId, long periodoEscolarId);
    }
}