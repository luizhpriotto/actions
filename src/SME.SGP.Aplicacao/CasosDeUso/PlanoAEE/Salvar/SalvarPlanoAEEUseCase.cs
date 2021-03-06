using MediatR;
using SME.SGP.Dominio;
using SME.SGP.Infra;
using System;
using System.Threading.Tasks;

namespace SME.SGP.Aplicacao.CasosDeUso
{
    public class SalvarPlanoAEEUseCase : ISalvarPlanoAEEUseCase
    {
        private readonly IMediator mediator;

        public SalvarPlanoAEEUseCase(IMediator mediator)
        {
            this.mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        public async Task<RetornoPlanoAEEDto> Executar(PlanoAEEPersistenciaDto planoAeeDto)
        {
            var turma = await mediator.Send(new ObterTurmaComUeEDrePorCodigoQuery(planoAeeDto.TurmaCodigo));
            if (turma == null)
                throw new NegocioException("A turma informada não foi encontrada");

            var aluno = await mediator.Send(new ObterAlunoPorCodigoEolQuery(planoAeeDto.AlunoCodigo, DateTime.Now.Year));
            if (aluno == null)
                throw new NegocioException("O aluno informado não foi encontrado");

            var planoAeePersistidoDto = await mediator.Send(new SalvarPlanoAeeCommand(planoAeeDto, turma.Id, aluno.NomeAluno, aluno.CodigoAluno, aluno.NumeroAlunoChamada));

            if ((!planoAeeDto.Id.HasValue || planoAeeDto.Id.Value == 0) & await ParametroNotificacoesPlanoAtivo())
                await mediator.Send(new EnviarFilaNotificacaoCriacaoPlanoAEECommand(planoAeePersistidoDto.PlanoId));

            return planoAeePersistidoDto;
        }

        private async Task<bool> ParametroNotificacoesPlanoAtivo()
        {
            var parametro = await mediator.Send(new ObterParametroSistemaPorTipoEAnoQuery(TipoParametroSistema.GerarNotificacaoPlanoAEE, DateTime.Today.Year));

            return parametro != null && parametro.Ativo;
        }
    }
}