using SME.SGP.Infra;

namespace SME.SGP.Aplicacao.Interfaces.CasosDeUso
{
    public interface IObterAlunosPorCodigoEolNomeUseCase : IUseCase<FiltroBuscaEstudanteDto, PaginacaoResultadoDto<AlunoSimplesDto>>
    {
    }
}
