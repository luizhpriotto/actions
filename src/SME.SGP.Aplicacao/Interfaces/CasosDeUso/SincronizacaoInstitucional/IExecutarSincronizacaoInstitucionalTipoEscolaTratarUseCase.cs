﻿using SME.SGP.Infra;
using System.Threading.Tasks;

namespace SME.SGP.Aplicacao.Interfaces
{
    public interface IExecutarSincronizacaoInstitucionalTipoEscolaTratarUseCase
    {
        Task<bool> Executar(MensagemRabbit param);
    }
}
