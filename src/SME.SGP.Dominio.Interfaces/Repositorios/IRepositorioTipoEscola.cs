﻿using System.Collections.Generic;
using System.Threading.Tasks;

namespace SME.SGP.Dominio.Interfaces
{
    public interface IRepositorioTipoEscola : IRepositorioBase<TipoEscolaEol>
    {
        void Sincronizar(IEnumerable<TipoEscolaEol> tiposEscolas);
        Task<TipoEscolaEol> ObterPorCodigoAsync(long codigo);
    }
}