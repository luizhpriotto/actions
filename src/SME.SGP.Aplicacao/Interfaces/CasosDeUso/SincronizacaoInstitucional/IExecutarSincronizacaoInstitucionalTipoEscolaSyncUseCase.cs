﻿using SME.SGP.Infra;

namespace SME.SGP.Aplicacao.Interfaces
{
    public interface IExecutarSincronizacaoInstitucionalTipoEscolaSyncUseCase : IUseCase<MensagemRabbit, bool>
    {
    }
}
