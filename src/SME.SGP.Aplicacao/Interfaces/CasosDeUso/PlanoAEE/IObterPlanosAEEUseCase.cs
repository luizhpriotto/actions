﻿using SME.SGP.Infra;

namespace SME.SGP.Aplicacao
{
    public interface IObterPlanosAEEUseCase : IUseCase<FiltroPlanosAEEDto, PaginacaoResultadoDto<PlanoAEEResumoDto>>
    {
    }
}
