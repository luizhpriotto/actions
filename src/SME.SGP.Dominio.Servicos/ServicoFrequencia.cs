using MediatR;
using SME.SGP.Aplicacao;
using SME.SGP.Aplicacao.Integracoes;
using SME.SGP.Dominio.Interfaces;
using SME.SGP.Infra;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SME.SGP.Dominio.Servicos
{
    public class ServicoFrequencia : IServicoFrequencia
    {
        private readonly IRepositorioAula repositorioAula;
        private readonly IRepositorioFrequencia repositorioFrequencia;
        private readonly IRepositorioRegistroAusenciaAluno repositorioRegistroAusenciaAluno;
        private readonly IRepositorioTurma repositorioTurma;
        private readonly IServicoEol servicoEOL;
        private readonly IServicoUsuario servicoUsuario;
        private readonly IUnitOfWork unitOfWork;
        private readonly IMediator mediator;

        public ServicoFrequencia(IRepositorioFrequencia repositorioFrequencia,
                                 IRepositorioRegistroAusenciaAluno repositorioRegistroAusenciaAluno,
                                 IRepositorioAula repositorioAula,
                                 IServicoUsuario servicoUsuario,
                                 IUnitOfWork unitOfWork,
                                 IServicoEol servicoEOL,
                                 IRepositorioTurma repositorioTurma,
                                 IMediator mediator)
        {
            this.repositorioFrequencia = repositorioFrequencia ?? throw new System.ArgumentNullException(nameof(repositorioFrequencia));
            this.repositorioRegistroAusenciaAluno = repositorioRegistroAusenciaAluno ?? throw new System.ArgumentNullException(nameof(repositorioRegistroAusenciaAluno));
            this.repositorioAula = repositorioAula ?? throw new System.ArgumentNullException(nameof(repositorioAula));
            this.servicoUsuario = servicoUsuario ?? throw new System.ArgumentNullException(nameof(servicoUsuario));
            this.unitOfWork = unitOfWork ?? throw new System.ArgumentNullException(nameof(unitOfWork));
            this.servicoEOL = servicoEOL ?? throw new System.ArgumentNullException(nameof(servicoEOL));
            this.repositorioTurma = repositorioTurma ?? throw new System.ArgumentNullException(nameof(repositorioTurma));
            this.mediator = mediator ?? throw new System.ArgumentNullException(nameof(mediator));
        }        

        public async Task ExcluirFrequenciaAula(long aulaId)
        {
            await repositorioFrequencia.ExcluirFrequenciaAula(aulaId);
        }

        public IEnumerable<RegistroAusenciaAluno> ObterListaAusenciasPorAula(long aulaId)
        {
            return repositorioFrequencia.ObterListaFrequenciaPorAula(aulaId);
        }

        public async Task Registrar(long aulaId, IEnumerable<RegistroAusenciaAluno> registroAusenciaAlunos)
        {
            var usuario = await servicoUsuario.ObterUsuarioLogado();

            var aula = ObterAula(aulaId);
            var turma = await ObterTurma(aula.TurmaId);

            if (!aula.PermiteRegistroFrequencia(turma))
            {
                throw new NegocioException("Não é permitido registro de frequência para este componente curricular.");
            }

            if (!usuario.EhGestorEscolar())
            {
                ValidaSeUsuarioPodeCriarAula(aula, usuario);
                await ValidaProfessorPodePersistirTurmaDisciplina(aula.TurmaId, usuario.CodigoRf, aula.DisciplinaId, aula.DataAula, usuario);
            }            

            var alunos = await ObterAlunos(aula);

            var registroFrequencia = await mediator.Send( new ObterRegistroFrequenciaPorAulaIdQuery(aulaId));
            var alteracaoRegistro = registroFrequencia != null;

            unitOfWork.IniciarTransacao();

            registroFrequencia = RegistraFrequenciaTurma(aula, registroFrequencia);

            RegistraAusenciaAlunos(registroAusenciaAlunos, alunos, registroFrequencia, aula.Quantidade, aula.DataAula);

            unitOfWork.PersistirTransacao();

            // Quando for alteração de registro de frequencia chama o servico para verificar se atingiu o limite de dias para alteração e notificar
            if (alteracaoRegistro)
                Background.Core.Cliente.Executar<IServicoNotificacaoFrequencia>(e => e.VerificaRegraAlteracaoFrequencia(registroFrequencia.Id, registroFrequencia.CriadoEm, DateTime.Now, usuario.Id));
        }

        private async Task<IEnumerable<AlunoPorTurmaResposta>> ObterAlunos(Aula aula)
        {
            var alunos = await servicoEOL.ObterAlunosPorTurma(aula.TurmaId, aula.DataAula.Year);
            if (alunos == null || !alunos.Any())
            {
                throw new NegocioException("Não foram encontrados alunos para a turma informada.");
            }

            return alunos;
        }

        private Aula ObterAula(long aulaId)
        {
            var aula = repositorioAula.ObterPorId(aulaId);
            if (aula == null)
            {
                throw new NegocioException("A aula informada não foi encontrada.");
            }

            return aula;
        }

        private async Task<Turma> ObterTurma(string turmaId)
        {
            var turma = await repositorioTurma.ObterPorCodigo(turmaId);
            if (turma == null)
                throw new NegocioException("Não foi encontrada uma turma com o id informado. Verifique se você possui abrangência para essa turma.");
            return turma;
        }

        private void RegistraAusenciaAlunos(IEnumerable<RegistroAusenciaAluno> registroAusenciaAlunos, IEnumerable<AlunoPorTurmaResposta> alunos, RegistroFrequencia registroFrequencia, int quantidadeAulas, DateTime dataAula)
        {
            foreach (var ausencia in registroAusenciaAlunos)
            {
                if (ausencia.NumeroAula > quantidadeAulas)
                    throw new NegocioException($"O número de aula informado: Aula {ausencia.NumeroAula} não foi encontrado.");

                var aluno = alunos.Where(c => c.CodigoAluno == ausencia.CodigoAluno && c.EstaAtivo(dataAula)).Any() ?
                    alunos.FirstOrDefault(c => c.CodigoAluno == ausencia.CodigoAluno && c.EstaAtivo(dataAula)) :
                    alunos.FirstOrDefault(c => c.CodigoAluno == ausencia.CodigoAluno);

                if (aluno == null)
                    throw new NegocioException("O aluno informado na frequência não pertence a essa turma.");

                ausencia.RegistroFrequenciaId = registroFrequencia.Id;
                repositorioRegistroAusenciaAluno.Salvar(ausencia);
            }
        }

        private RegistroFrequencia RegistraFrequenciaTurma(Aula aula, RegistroFrequencia registroFrequencia)
        {
            if (registroFrequencia == null)
            {
                registroFrequencia = new RegistroFrequencia(aula);
                repositorioFrequencia.Salvar(registroFrequencia);
            }
            else
                repositorioRegistroAusenciaAluno.MarcarRegistrosAusenciaAlunoComoExcluidoPorRegistroFrequenciaId(registroFrequencia.Id);
            return registroFrequencia;
        }

        private async Task ValidaProfessorPodePersistirTurmaDisciplina(string turmaId, string codigoRf, string disciplinaId, DateTime dataAula, Usuario usuario = null)
        {
            if (usuario == null)
                usuario = await servicoUsuario.ObterUsuarioLogado();

            if (!usuario.EhProfessorCj() && !await servicoUsuario.PodePersistirTurmaDisciplina(codigoRf, turmaId, disciplinaId, dataAula.Local()))
                throw new NegocioException("Você não pode fazer alterações ou inclusões nesta turma, componente curricular e data.");
        }

        private void ValidaSeUsuarioPodeCriarAula(Aula aula, Usuario usuario)
        {
            if (!usuario.PodeRegistrarFrequencia(aula))
            {
                throw new NegocioException("Não é possível registrar a frequência pois esse componente curricular não permite substituição.");
            }
        }
    }
}