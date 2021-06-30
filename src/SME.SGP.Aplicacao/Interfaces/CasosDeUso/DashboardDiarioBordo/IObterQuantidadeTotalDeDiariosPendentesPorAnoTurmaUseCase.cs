﻿using SME.SGP.Infra;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SME.SGP.Aplicacao
{
    public interface IObterQuantidadeTotalDeDiariosPendentesPorAnoTurmaUseCase
    {
        Task<IEnumerable<GraficoTotalDiariosEDevolutivasDTO>> Executar(FiltroDasboardDiarioBordoDto filtro);
    }
}
