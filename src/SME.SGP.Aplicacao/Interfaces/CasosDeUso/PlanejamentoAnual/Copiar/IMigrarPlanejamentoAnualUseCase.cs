using SME.SGP.Infra;
using System.Threading.Tasks;

namespace SME.SGP.Aplicacao
{
    public interface IMigrarPlanejamentoAnualUseCase
    {
        Task<bool> Executar(MigrarPlanejamentoAnualDto dto);
    }
}