﻿using SME.SGP.Dominio;

namespace SME.SGP.Dados.Mapeamentos
{
    public class RecuperacaoParalelaRespostaMap : BaseMap<RecuperacaoParalelaResposta>
    {
        public RecuperacaoParalelaRespostaMap()
        {
            ToTable("recuperacao_paralela_resposta");
            Map(c => c.DtInicio).ToColumn("dt_inicio");
            Map(c => c.DtFim).ToColumn("dt_fim");
        }
    }
}