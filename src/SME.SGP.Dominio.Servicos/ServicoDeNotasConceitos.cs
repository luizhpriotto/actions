using MediatR;
using Microsoft.Extensions.Configuration;
using SME.SGP.Aplicacao;
using SME.SGP.Aplicacao.Integracoes;
using SME.SGP.Dominio.Interfaces;
using SME.SGP.Infra;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SME.SGP.Dominio
{
    public class ServicoDeNotasConceitos : IServicoDeNotasConceitos
    {
        private readonly IConsultasAbrangencia consultasAbrangencia;

        private readonly string hostAplicacao;
        private readonly IRepositorioAtividadeAvaliativa repositorioAtividadeAvaliativa;
        private readonly IRepositorioAtividadeAvaliativaDisciplina repositorioAtividadeAvaliativaDisciplina;
        private readonly IRepositorioAula repositorioAula;
        private readonly IRepositorioCiclo repositorioCiclo;
        private readonly IRepositorioConceito repositorioConceito;
        private readonly IRepositorioNotaParametro repositorioNotaParametro;
        private readonly IRepositorioNotasConceitos repositorioNotasConceitos;
        private readonly IRepositorioNotaTipoValor repositorioNotaTipoValor;
        private readonly IRepositorioPeriodoEscolar repositorioPeriodoEscolar;
        private readonly IRepositorioTurma repositorioTurma;
        private readonly IRepositorioParametrosSistema repositorioParametrosSistema;
        private readonly IRepositorioPeriodoFechamento repositorioPeriodoFechamento;
        private readonly IServicoEol servicoEOL;
        private readonly IServicoNotificacao servicoNotificacao;
        private readonly IServicoUsuario servicoUsuario;
        private readonly IUnitOfWork unitOfWork;
        private readonly IMediator mediator;

        public Turma turma { get; set; }

        private IEnumerable<Usuario> _usuariosCPs;
        public IEnumerable<Usuario> usuariosCPs
        {
            get
            {
                if (_usuariosCPs == null)
                {
                    var listaCPsUe = servicoEOL.ObterFuncionariosPorCargoUe(turma.Ue.CodigoUe, (long)Cargo.CP);
                    _usuariosCPs = CarregaUsuariosPorRFs(listaCPsUe);
                }

                return _usuariosCPs;
            }
        }

        private Usuario _usuarioDiretor;
        public Usuario usuarioDiretor
        {
            get
            {
                if (_usuarioDiretor == null)
                {
                    var diretor = servicoEOL.ObterFuncionariosPorCargoUe(turma.Ue.CodigoUe, (long)Cargo.Diretor);
                    _usuarioDiretor = CarregaUsuariosPorRFs(diretor).First();
                }

                return _usuarioDiretor;
            }
        }

        public ServicoDeNotasConceitos(IRepositorioAtividadeAvaliativa repositorioAtividadeAvaliativa,
            IServicoEol servicoEOL, IConsultasAbrangencia consultasAbrangencia,
            IRepositorioNotaTipoValor repositorioNotaTipoValor, IRepositorioCiclo repositorioCiclo,
            IRepositorioConceito repositorioConceito, IRepositorioNotaParametro repositorioNotaParametro,
            IRepositorioNotasConceitos repositorioNotasConceitos, IUnitOfWork unitOfWork,
            IRepositorioAtividadeAvaliativaDisciplina repositorioAtividadeAvaliativaDisciplina,
            IRepositorioPeriodoFechamento repositorioPeriodoFechamento,
            IServicoNotificacao servicoNotificacao, IRepositorioPeriodoEscolar repositorioPeriodoEscolar,
            IRepositorioAula repositorioAula, IRepositorioTurma repositorioTurma, IRepositorioParametrosSistema repositorioParametrosSistema,
            IServicoUsuario servicoUsuario, IConfiguration configuration, IMediator mediator)
        {
            this.repositorioAtividadeAvaliativa = repositorioAtividadeAvaliativa ?? throw new ArgumentNullException(nameof(repositorioAtividadeAvaliativa));
            this.servicoEOL = servicoEOL ?? throw new ArgumentNullException(nameof(servicoEOL));
            this.consultasAbrangencia = consultasAbrangencia ?? throw new ArgumentNullException(nameof(consultasAbrangencia));
            this.repositorioNotaTipoValor = repositorioNotaTipoValor ?? throw new ArgumentNullException(nameof(repositorioNotaTipoValor));
            this.repositorioCiclo = repositorioCiclo ?? throw new ArgumentNullException(nameof(repositorioCiclo));
            this.repositorioConceito = repositorioConceito ?? throw new ArgumentNullException(nameof(repositorioConceito));
            this.repositorioNotaParametro = repositorioNotaParametro ?? throw new ArgumentNullException(nameof(repositorioNotaParametro));
            this.repositorioNotasConceitos = repositorioNotasConceitos ?? throw new ArgumentNullException(nameof(repositorioNotasConceitos));
            this.repositorioPeriodoEscolar = repositorioPeriodoEscolar ?? throw new ArgumentNullException(nameof(repositorioPeriodoEscolar));
            this.repositorioAtividadeAvaliativaDisciplina = repositorioAtividadeAvaliativaDisciplina ?? throw new ArgumentNullException(nameof(repositorioAtividadeAvaliativaDisciplina));
            this.repositorioAula = repositorioAula ?? throw new ArgumentNullException(nameof(repositorioAula));
            this.repositorioTurma = repositorioTurma ?? throw new ArgumentNullException(nameof(repositorioTurma));
            this.repositorioParametrosSistema = repositorioParametrosSistema ?? throw new ArgumentNullException(nameof(repositorioParametrosSistema));
            this.repositorioPeriodoFechamento = repositorioPeriodoFechamento ?? throw new ArgumentNullException(nameof(repositorioPeriodoFechamento));
            this.unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            this.servicoNotificacao = servicoNotificacao ?? throw new ArgumentNullException(nameof(servicoNotificacao));
            this.servicoUsuario = servicoUsuario ?? throw new ArgumentNullException(nameof(servicoUsuario));
            this.hostAplicacao = configuration["UrlFrontEnd"];
            this.mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        public async Task Salvar(IEnumerable<NotaConceito> notasConceitos, string professorRf, string turmaId, string disciplinaId)
        {
            turma = await repositorioTurma.ObterTurmaComUeEDrePorCodigo(turmaId);
            if (turma == null)
                throw new NegocioException($"Turma com código [{turmaId}] não localizada");

            var idsAtividadesAvaliativas = notasConceitos.Select(x => x.AtividadeAvaliativaID);

            var atividadesAvaliativas = repositorioAtividadeAvaliativa.ListarPorIds(idsAtividadesAvaliativas);

            var alunos = await servicoEOL.ObterAlunosPorTurma(turmaId);

            if (alunos == null || !alunos.Any())
                throw new NegocioException("Não foi encontrado nenhum aluno para a turma informada");

            var usuario = await servicoUsuario.ObterUsuarioLogado();


            await ValidarAvaliacoes(idsAtividadesAvaliativas, atividadesAvaliativas, professorRf, disciplinaId, usuario.EhGestorEscolar());

            var entidadesSalvar = new List<NotaConceito>();

            var notasPorAvaliacoes = notasConceitos.GroupBy(x => x.AtividadeAvaliativaID);

            var dataConsiderada = atividadesAvaliativas.Any() ? atividadesAvaliativas.OrderBy(aa => aa.DataAvaliacao).Last().DataAvaliacao : DateTime.Today;

            if (!usuario.EhGestorEscolar())
                await VerificaSeProfessorPodePersistirTurmaDisciplina(professorRf, turmaId, disciplinaId, dataConsiderada, usuario);

            foreach (var notasPorAvaliacao in notasPorAvaliacoes)
            {
                var avaliacao = atividadesAvaliativas.FirstOrDefault(x => x.Id == notasPorAvaliacao.Key);

                entidadesSalvar.AddRange(await ValidarEObter(notasPorAvaliacao.ToList(), avaliacao, alunos, professorRf, disciplinaId, usuario, turma));
            }

            SalvarNoBanco(entidadesSalvar);
            var alunosId = alunos.Select(a => a.CodigoAluno).ToList();
            await validarMediaAlunos(idsAtividadesAvaliativas, alunosId, usuario, disciplinaId);
        }

        public async Task<NotaTipoValor> TipoNotaPorAvaliacao(AtividadeAvaliativa atividadeAvaliativa, bool consideraHistorico = false)
        {
            var turmaEOL = await servicoEOL.ObterDadosTurmaPorCodigo(atividadeAvaliativa.TurmaId.ToString());

            if (turmaEOL.TipoTurma == Enumerados.TipoTurma.EdFisica)
                return repositorioNotaTipoValor.ObterPorTurmaId(Convert.ToInt64(atividadeAvaliativa.TurmaId), Enumerados.TipoTurma.EdFisica);

            var notaTipo = await ObterNotaTipo(atividadeAvaliativa.TurmaId, atividadeAvaliativa.DataAvaliacao, consideraHistorico);

            if (notaTipo == null)
                throw new NegocioException("Não foi encontrado tipo de nota para a avaliação informada");

            return notaTipo;
        }

        public async Task validarMediaAlunos(IEnumerable<long> idsAtividadesAvaliativas, IEnumerable<string> alunosId, Usuario usuario, string disciplinaId)
        {
            var dataAtual = DateTime.Now;
            var notasConceitos = repositorioNotasConceitos.ObterNotasPorAlunosAtividadesAvaliativas(idsAtividadesAvaliativas, alunosId, disciplinaId);
            var atividadesAvaliativas = repositorioAtividadeAvaliativa.ListarPorIds(idsAtividadesAvaliativas);

            var notasPorAvaliacoes = notasConceitos.GroupBy(x => x.AtividadeAvaliativaID);
            var percentualAlunosInsuficientes = double.Parse(await mediator.Send(new ObterValorParametroSistemaTipoEAnoQuery(TipoParametroSistema.PercentualAlunosInsuficientes, DateTime.Today.Year)));

            foreach (var notasPorAvaliacao in notasPorAvaliacoes)
            {
                var atividadeAvaliativa = atividadesAvaliativas.FirstOrDefault(x => x.Id == notasPorAvaliacao.Key);
                var valoresConceito = await repositorioConceito.ObterPorData(atividadeAvaliativa.DataAvaliacao);
                var turmaHistorica = await consultasAbrangencia.ObterAbrangenciaTurma(atividadeAvaliativa.TurmaId, true);
                var tipoNota = await TipoNotaPorAvaliacao(atividadeAvaliativa, turmaHistorica != null);
                var ehTipoNota = tipoNota.TipoNota == TipoNota.Nota;
                var notaParametro = await repositorioNotaParametro.ObterPorDataAvaliacao(atividadeAvaliativa.DataAvaliacao);
                var quantidadeAlunos = notasPorAvaliacao.Count();
                var quantidadeAlunosSuficientes = 0;
                var turma = await repositorioTurma.ObterTurmaComUeEDrePorCodigo(atividadeAvaliativa.TurmaId);

                var periodosEscolares = await BuscarPeriodosEscolaresDaAtividade(atividadeAvaliativa);
                var periodoAtividade = periodosEscolares.FirstOrDefault(x => x.PeriodoInicio.Date <= atividadeAvaliativa.DataAvaliacao.Date && x.PeriodoFim.Date >= atividadeAvaliativa.DataAvaliacao.Date);

                foreach (var nota in notasPorAvaliacao)
                {
                    var valorConceito = ehTipoNota ? valoresConceito.FirstOrDefault(a => a.Id == nota.ConceitoId) : null;
                    quantidadeAlunosSuficientes += ehTipoNota ?
                        nota.Nota >= notaParametro.Media ? 1 : 0 :
                        valorConceito != null && valorConceito.Aprovado ? 1 : 0;
                }
                string mensagemNotasConceitos = $"<p>Os resultados da atividade avaliativa '{atividadeAvaliativa.NomeAvaliacao}' da turma {turma.Nome} da {turma.Ue.Nome} (DRE {turma.Ue.Dre.Nome}) no bimestre {periodoAtividade.Bimestre} de {turma.AnoLetivo} foram alterados " +
              $"pelo Professor {usuario.Nome} ({usuario.CodigoRf}) em {dataAtual.ToString("dd/MM/yyyy")} às {dataAtual.ToString("HH:mm")} estão abaixo da média.</p>" +
              $"<a href='{hostAplicacao}diario-classe/notas/{disciplinaId}/{periodoAtividade.Bimestre}'>Clique aqui para visualizar os detalhes.</a>";

                // Avalia se a quantidade de alunos com nota/conceito suficientes esta abaixo do percentual parametrizado para notificação
                if (quantidadeAlunosSuficientes < (quantidadeAlunos * percentualAlunosInsuficientes / 100))
                {
                    // Notifica todos os CPs da UE
                    foreach (var usuarioCP in usuariosCPs)
                    {
                        servicoNotificacao.Salvar(new Notificacao()
                        {
                            Ano = atividadeAvaliativa.CriadoEm.Year,
                            Categoria = NotificacaoCategoria.Alerta,
                            DreId = atividadeAvaliativa.DreId,
                            Mensagem = mensagemNotasConceitos,
                            UsuarioId = usuarioCP.Id,
                            Tipo = NotificacaoTipo.Notas,
                            Titulo = $"Resultados de Atividade Avaliativa - Turma {turma.Nome}",
                            TurmaId = atividadeAvaliativa.TurmaId,
                            UeId = atividadeAvaliativa.UeId,
                        });
                    }
                }
            }
        }

        private IEnumerable<Usuario> CarregaUsuariosPorRFs(IEnumerable<UsuarioEolRetornoDto> listaCPsUe)
        {
            foreach (var cpUe in listaCPsUe)
            {
                yield return servicoUsuario.ObterUsuarioPorCodigoRfLoginOuAdiciona(cpUe.CodigoRf);
            }
        }

        private static void ValidarSeAtividadesAvaliativasExistem(IEnumerable<long> avaliacoesAlteradasIds, IEnumerable<AtividadeAvaliativa> avaliacoes)
        {
            avaliacoesAlteradasIds.ToList().ForEach(avalicaoAlteradaId =>
            {
                var atividadeavaliativa = avaliacoes.FirstOrDefault(avaliacao => avaliacao.Id == avalicaoAlteradaId);

                if (atividadeavaliativa == null)
                    throw new NegocioException($"Não foi encontrada atividade avaliativa com o codigo {avalicaoAlteradaId}");
            });
        }

        private async Task<IEnumerable<PeriodoEscolar>> BuscarPeriodosEscolaresDaAtividade(AtividadeAvaliativa atividadeAvaliativa)
        {
            var dataFinal = atividadeAvaliativa.DataAvaliacao.Date.AddHours(23).AddMinutes(59).AddSeconds(59);
            var aula = await repositorioAula.ObterAulaIntervaloTurmaDisciplina(atividadeAvaliativa.DataAvaliacao, dataFinal, atividadeAvaliativa.TurmaId, atividadeAvaliativa.Id);

            if (aula == null)
                throw new NegocioException($"Não encontrada aula para a atividade avaliativa '{atividadeAvaliativa.NomeAvaliacao}' no dia {atividadeAvaliativa.DataAvaliacao.Date.ToString("dd/MM/yyyy")}");

            IEnumerable<PeriodoEscolar> periodosEscolares = await repositorioPeriodoEscolar.ObterPorTipoCalendario(aula.TipoCalendarioId);
            return periodosEscolares;
        }

        public async Task<NotaTipoValor> ObterNotaTipo(string turmaCodigo, DateTime data, bool consideraHistorico = false)
        {
            var turma = await consultasAbrangencia.ObterAbrangenciaTurma(turmaCodigo, consideraHistorico);

            if (turma == null)
                throw new NegocioException("Não foi encontrada a turma informada");

            string anoCicloModalidade = !String.IsNullOrEmpty(turma?.Ano) ? turma.Ano == AnoCiclo.Alfabetizacao.Name() ? AnoCiclo.Alfabetizacao.Description() : turma.Ano : string.Empty;
            var ciclo = repositorioCiclo.ObterCicloPorAnoModalidade(anoCicloModalidade, turma.Modalidade);

            if (ciclo == null)
                throw new NegocioException("Não foi encontrado o ciclo da turma informada");

            return repositorioNotaTipoValor.ObterPorCicloIdDataAvalicacao(ciclo.Id, data);
        }

        public Task<NotaTipoValor> ObterNotaTipoPorTurmaDataReferencia(Turma turma, DateTime data, bool consideraHistorico = false)
        {
            var ciclo = repositorioCiclo.ObterCicloPorAnoModalidade(turma.Ano, turma.ModalidadeCodigo);

            if (ciclo == null)
                throw new NegocioException("Não foi encontrado o ciclo da turma informada");

            return Task.FromResult(repositorioNotaTipoValor.ObterPorCicloIdDataAvalicacao(ciclo.Id, data));
        }

        private void SalvarNoBanco(List<NotaConceito> EntidadesSalvar)
        {
            unitOfWork.IniciarTransacao();

            foreach (var entidade in EntidadesSalvar)
            {
                if (entidade.Id >= 0 && entidade.ObterNota() == null)
                    repositorioNotasConceitos.Remover(entidade);
                else if (entidade.ObterNota() != null)
                    repositorioNotasConceitos.Salvar(entidade);
            }

            unitOfWork.PersistirTransacao();
        }

        private async Task ValidarAvaliacoes(IEnumerable<long> avaliacoesAlteradasIds, IEnumerable<AtividadeAvaliativa> atividadesAvaliativas, string professorRf, string disciplinaId, bool gestorEscolar)
        {
            if (atividadesAvaliativas == null || !atividadesAvaliativas.Any())
                throw new NegocioException("Não foi encontrada nenhuma da(s) avaliação(es) informada(s)");

            ValidarSeAtividadesAvaliativasExistem(avaliacoesAlteradasIds, atividadesAvaliativas);
            var disciplinasEol = await servicoEOL.ObterProfessoresTitularesDisciplinas(turma.CodigoTurma);

            foreach (var atividadeAvaliativa in atividadesAvaliativas)
                await ValidarDataAvaliacaoECriador(atividadeAvaliativa, professorRf, disciplinaId, disciplinasEol, gestorEscolar);
        }

        private async Task ValidarDataAvaliacaoECriador(AtividadeAvaliativa atividadeAvaliativa, string professorRf, string disciplinaId, IEnumerable<ProfessorTitularDisciplinaEol> disciplinasEol, bool gestorEscolar)
        {
            if (atividadeAvaliativa.DataAvaliacao.Date > DateTime.Today)
                throw new NegocioException("Não é possivel atribuir notas/conceitos para avaliação(es) com data(s) futura(s)");

            bool ehTitular = false;

            if (!gestorEscolar)
            {
                if (disciplinasEol != null && disciplinasEol.Any())
                    ehTitular = disciplinasEol.Any(d => d.DisciplinaId.ToString() == disciplinaId && d.ProfessorRf == professorRf);

                var usuarioLogado = await mediator.Send(new ObterUsuarioPorRfQuery(professorRf));
                var usuarioPossuiAtribuicaoNaTurmaNaData = await mediator.Send(new ObterUsuarioPossuiPermissaoNaTurmaEDisciplinaQuery(Convert.ToInt64(disciplinaId), atividadeAvaliativa.TurmaId, atividadeAvaliativa.DataAvaliacao, usuarioLogado));

                if ((atividadeAvaliativa.EhCj && !atividadeAvaliativa.ProfessorRf.Equals(professorRf)) ||
                    (!atividadeAvaliativa.EhCj && !ehTitular && !usuarioPossuiAtribuicaoNaTurmaNaData))
                    throw new NegocioException("Somente o professor que criou a avaliação e/ou titular, pode atribuir e/ou editar notas/conceitos");
            }
        }

        private async Task<IEnumerable<NotaConceito>> ValidarEObter(IEnumerable<NotaConceito> notasConceitos, AtividadeAvaliativa atividadeAvaliativa, IEnumerable<AlunoPorTurmaResposta> alunos, string professorRf, string disciplinaId,
            Usuario usuario, Turma turma)
        {
            var notasMultidisciplina = new List<NotaConceito>();
            var alunosNotasExtemporaneas = new StringBuilder();
            var nota = notasConceitos.FirstOrDefault();
            var turmaHistorica = await consultasAbrangencia.ObterAbrangenciaTurma(turma.CodigoTurma, true);            
            var tipoNota = await TipoNotaPorAvaliacao(atividadeAvaliativa, turmaHistorica != null);
            var notaParametro = await repositorioNotaParametro.ObterPorDataAvaliacao(atividadeAvaliativa.DataAvaliacao);
            var dataAtual = DateTime.Now;

            // Verifica Bimestre Atual
            var dataPesquisa = DateTime.Today;
            var periodosEscolares = await BuscarPeriodosEscolaresDaAtividade(atividadeAvaliativa);
            var periodoEscolarAtual = periodosEscolares.FirstOrDefault(x => x.PeriodoInicio.Date <= dataPesquisa.Date && x.PeriodoFim.Date >= dataPesquisa.Date);
            var periodoEscolarAvaliacao = periodosEscolares.FirstOrDefault(x => x.PeriodoInicio.Date <= atividadeAvaliativa.DataAvaliacao.Date && x.PeriodoFim.Date >= atividadeAvaliativa.DataAvaliacao.Date);
            if (periodoEscolarAvaliacao == null)
                throw new NegocioException("Período escolar da atividade avaliativa não encontrado");

            var bimestreAvaliacao = periodoEscolarAvaliacao.Bimestre;
            var existePeriodoEmAberto = periodoEscolarAtual != null && periodoEscolarAtual.Bimestre == periodoEscolarAvaliacao.Bimestre
                || await repositorioPeriodoFechamento.ExistePeriodoPorUeDataBimestre(turma.UeId, DateTime.Today, bimestreAvaliacao);

            foreach (var notaConceito in notasConceitos)
            {
                if (notaConceito.Id > 0)
                {
                    if(!usuario.EhGestorEscolar())
                        notaConceito.Validar(professorRf);
                }

                var aluno = alunos.FirstOrDefault(a => a.CodigoAluno.Equals(notaConceito.AlunoId));

                if (aluno == null)
                    throw new NegocioException($"Não foi encontrado aluno com o codigo {notaConceito.AlunoId}");

                if (tipoNota.TipoNota == TipoNota.Nota)
                {
                    notaConceito.ValidarNota(notaParametro, aluno.NomeAluno);
                    if (notaParametro == null)
                        throw new NegocioException("Não foi possível localizar o parâmetro de nota.");
                }
                else
                {
                    var conceitos = await repositorioConceito.ObterPorData(atividadeAvaliativa.DataAvaliacao);

                    if (conceitos == null)
                        throw new NegocioException("Não foi possível localizar o parâmetro de conceito.");
                }

                notaConceito.TipoNota = tipoNota.TipoNota;
                notaConceito.DisciplinaId = disciplinaId;
                if (atividadeAvaliativa.Categoria.Equals(CategoriaAtividadeAvaliativa.Interdisciplinar) && notaConceito.Id.Equals(0))
                {
                    var atividadeDisciplinas = repositorioAtividadeAvaliativaDisciplina.ListarPorIdAtividade(atividadeAvaliativa.Id).Result;
                    foreach (var atividade in atividadeDisciplinas)
                    {
                        if (!atividade.DisciplinaId.Equals(disciplinaId))
                        {
                            notasMultidisciplina.Add(new NotaConceito
                            {
                                AlunoId = notaConceito.AlunoId,
                                AtividadeAvaliativaID = notaConceito.AtividadeAvaliativaID,
                                DisciplinaId = atividade.DisciplinaId,
                                Nota = notaConceito.Nota,
                                ConceitoId = notaConceito.ConceitoId,
                                TipoNota = notaConceito.TipoNota
                            });
                        }
                    }
                }

                if ((notaConceito.Id > 0) && (!existePeriodoEmAberto))
                {
                    alunosNotasExtemporaneas.AppendLine($"<li>{aluno.CodigoAluno} - {aluno.NomeAluno}</li>");
                }
            }

            if (alunosNotasExtemporaneas.ToString().Length > 0)
            {
                string mensagem = $"<p>Os resultados da atividade avaliativa '{atividadeAvaliativa.NomeAvaliacao}' da turma {turma.Nome} da {turma.Ue.Nome} (DRE {turma.Ue.Dre.Nome}) no bimestre {bimestreAvaliacao} de {turma.AnoLetivo} foram alterados " +
                    $"pelo Professor {usuario.Nome} ({usuario.CodigoRf}) em {dataAtual.ToString("dd/MM/yyyy")} às {dataAtual.ToString("HH:mm")} para os seguintes alunos:</p><br/>{alunosNotasExtemporaneas.ToString()}" +
                    $"<a href='{hostAplicacao}diario-classe/notas/{nota.DisciplinaId}/{bimestreAvaliacao}'>Clique aqui para visualizar os detalhes.</a>";

                foreach (var usuarioCP in usuariosCPs)
                {
                    NotificarUsuarioAlteracaoExtemporanea(atividadeAvaliativa, mensagem, usuarioCP.Id, turma.Nome);
                }

                NotificarUsuarioAlteracaoExtemporanea(atividadeAvaliativa, mensagem, usuarioDiretor.Id, turma.Nome);
            }

            var result = notasConceitos.ToList();
            result.AddRange(notasMultidisciplina);
            return result;
        }

        private void NotificarUsuarioAlteracaoExtemporanea(AtividadeAvaliativa atividadeAvaliativa, string mensagem, long usuarioId, string turmaNome)
        {
            servicoNotificacao.Salvar(new Notificacao()
            {
                Ano = atividadeAvaliativa.CriadoEm.Year,
                Categoria = NotificacaoCategoria.Alerta,
                DreId = atividadeAvaliativa.DreId,
                Mensagem = mensagem,
                UsuarioId = usuarioId,
                Tipo = NotificacaoTipo.Notas,
                Titulo = $"Alteração em Atividade Avaliativa - Turma {turmaNome}",
                TurmaId = atividadeAvaliativa.TurmaId,
                UeId = atividadeAvaliativa.UeId,
            });
        }

        private async Task VerificaSeProfessorPodePersistirTurmaDisciplina(string codigoRf, string turmaId, string disciplinaId, DateTime dataAula, Usuario usuario = null)
        {
            if (usuario == null)
                usuario = await servicoUsuario.ObterUsuarioLogado();

            if (!usuario.EhProfessorCj() && !await servicoUsuario.PodePersistirTurmaDisciplina(codigoRf, turmaId, disciplinaId, dataAula))
                throw new NegocioException("Você não pode fazer alterações ou inclusões nesta turma, componente curricular e data.");
        }
    }
}