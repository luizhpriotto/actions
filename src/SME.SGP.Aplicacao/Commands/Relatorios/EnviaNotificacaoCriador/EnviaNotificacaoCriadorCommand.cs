using MediatR;
using SME.SGP.Dominio;

namespace SME.SGP.Aplicacao
{
    public class EnviaNotificacaoCriadorCommand : IRequest<bool>
    {
        public EnviaNotificacaoCriadorCommand(RelatorioCorrelacao relatorioCorrelacao, string urlRedirecionamentoBase, string mensagemUsuario = "", string mensagemTitulo = "")
        {
            RelatorioCorrelacao = relatorioCorrelacao;
            UrlRedirecionamentoBase = urlRedirecionamentoBase;
            MensagemUsuario = mensagemUsuario;
            MensagemTitulo = mensagemTitulo;
        }

        public RelatorioCorrelacao RelatorioCorrelacao { get; set; }
        public string UrlRedirecionamentoBase { get; set; }
        public string MensagemUsuario { get; set; }
        public string MensagemTitulo { get; set; }

    }
}
