﻿using MediatR;
using SME.SGP.Dominio;
using SME.SGP.Dominio.Interfaces;
using SME.SGP.Infra;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SME.SGP.Aplicacao
{
    public class ObterTiposCalendarioPorAnoLetivoModalidadeQueryHandler : IRequestHandler<ObterTiposCalendarioPorAnoLetivoModalidadeQuery, IEnumerable<TipoCalendario>>
    {
        private IRepositorioTipoCalendario repositorioTipoCalendario;

        public ObterTiposCalendarioPorAnoLetivoModalidadeQueryHandler(IRepositorioTipoCalendario repositorioTipoCalendario)
        {
            this.repositorioTipoCalendario = repositorioTipoCalendario ?? throw new ArgumentNullException(nameof(repositorioTipoCalendario));
        }
        public async Task<IEnumerable<TipoCalendario>> Handle(ObterTiposCalendarioPorAnoLetivoModalidadeQuery request, CancellationToken cancellationToken)
        {
            var modalidades = request.Modalidades.Select(m => (int)m.ObterModalidadeTipoCalendario()).ToArray();
            return await repositorioTipoCalendario.ListarPorAnoLetivoEModalidades(request.AnoLetivo, modalidades);
        }
    }
}