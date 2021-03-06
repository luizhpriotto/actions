import React, { useState, useEffect, useRef, useCallback } from 'react';
import queryString from 'query-string';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import Card from '~/componentes/card';
import Grid from '~/componentes/grid';
import Button from '~/componentes/button';
import RadioGroupButton from '~/componentes/radioGroupButton';
import CampoTexto from '~/componentes/campoTexto';
import SelectComponent from '~/componentes/select';
import { Colors, Label, Loader, Editor } from '~/componentes';
import history from '~/servicos/history';
import { Div, Titulo, Badge, InseridoAlterado } from './avaliacao.css';
import RotasDTO from '~/dtos/rotasDto';
import ServicoAvaliacao from '~/servicos/Paginas/Calendario/ServicoAvaliacao';
import { erro, sucesso, confirmar } from '~/servicos/alertas';
import ModalCopiarAvaliacao from './componentes/ModalCopiarAvaliacao';
import Alert from '~/componentes/alert';

// Utils
import { valorNuloOuVazio } from '~/utils/funcoes/gerais';
import AlertaModalidadeInfantil from '~/componentes-sgp/AlertaModalidadeInfantil/alertaModalidadeInfantil';
import { ehTurmaInfantil } from '~/servicos/Validacoes/validacoesInfatil';
import JoditEditor from '~/componentes/jodit-editor/joditEditor';

const AvaliacaoForm = ({ match, location }) => {
  const [
    mostrarModalCopiarAvaliacao,
    setMostrarModalCopiarAvaliacao,
  ] = useState(false);
  const permissaoTela = useSelector(
    state => state.usuario.permissoes[RotasDTO.CADASTRO_DE_AVALIACAO]
  );
  const modalidadesFiltroPrincipal = useSelector(
    store => store.filtro.modalidades
  );

  const botaoCadastrarRef = useRef(null);
  const [refForm, setRefForm] = useState({});

  const [desabilitarCampos, setDesabilitarCampos] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [dentroPeriodo, setDentroPeriodo] = useState(true);
  const [podeLancaNota, setPodeLancaNota] = useState(true);

  const clicouBotaoVoltar = async () => {
    if (dentroPeriodo && modoEdicao) {
      const confirmado = await confirmar(
        'Aten????o',
        'Suas altera????es n??o foram salvas, deseja salvar agora?'
      );
      if (confirmado) {
        if (botaoCadastrarRef.current) botaoCadastrarRef.current.click();
      } else {
        history.push(RotasDTO.CALENDARIO_PROFESSOR);
      }
    } else {
      history.push(RotasDTO.CALENDARIO_PROFESSOR);
    }
  };

  const [idAvaliacao, setIdAvaliacao] = useState('');
  const [inseridoAlterado, setInseridoAlterado] = useState({
    alteradoEm: '',
    alteradoPor: '',
    criadoEm: '',
    criadoPor: '',
  });

  const aoTrocarCampos = () => {
    if (!modoEdicao) {
      setModoEdicao(true);
    }
  };

  const onChangeDisciplina = disciplinaId => {
    aoTrocarCampos();
    if (disciplinaId) {
      const componenteSelecionado = listaDisciplinas.find(
        item => item.codigoComponenteCurricular == disciplinaId
      );
      setPodeLancaNota(componenteSelecionado.lancaNota);
    } else {
      setPodeLancaNota(true);
    }
  };

  const clicouBotaoExcluir = async () => {
    const confirmado = await confirmar(
      'Aten????o',
      'Voc?? tem certeza que deseja excluir este registro?'
    );
    if (confirmado) {
      setCarregandoTela(true);
      const exclusao = await ServicoAvaliacao.excluir(idAvaliacao);
      if (exclusao && exclusao.status === 200) {
        setCarregandoTela(false);
        sucesso('Atividade avaliativa exclu??da com sucesso!');
        history.push(RotasDTO.CALENDARIO_PROFESSOR);
      } else {
        erro(exclusao);
        setCarregandoTela(false);
      }
    }
  };

  const clicouBotaoCadastrar = (form, e) => {
    e.persist();
    form.validateForm().then(() => form.handleSubmit(e));
  };

  const eventoAulaCalendarioEdicao = useSelector(
    store => store.calendarioProfessor.eventoAulaCalendarioEdicao
  );

  const diaAvaliacao = useSelector(
    store => store.calendarioProfessor.diaSelecionado
  );

  const [descricao, setDescricao] = useState('');
  const [copias, setCopias] = useState([]);
  const [carregandoTela, setCarregandoTela] = useState(false);
  const [listaDisciplinasRegencia, setListaDisciplinasRegencia] = useState([]);
  const [
    listaDisciplinasSelecionadas,
    setListaDisciplinasSelecionadas,
  ] = useState([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(undefined);
  const [desabilitarCopiarAvaliacao, setDesabilitarCopiarAvaliacao] = useState(
    false
  );

  const usuario = useSelector(store => store.usuario);

  const { turmaSelecionada } = usuario;
  const turmaId = turmaSelecionada ? turmaSelecionada.turma : 0;

  const [dataAvaliacao, setDataAvaliacao] = useState();

  const cadastrarAvaliacao = async dados => {
    const avaliacao = {};
    setCarregandoTela(true);
    if (Object.entries(eventoAulaCalendarioEdicao).length) {
      avaliacao.dreId = eventoAulaCalendarioEdicao.dre;
      avaliacao.turmaId = eventoAulaCalendarioEdicao.turma;
      avaliacao.ueId = eventoAulaCalendarioEdicao.unidadeEscolar;
    } else if (Object.entries(turmaSelecionada).length) {
      avaliacao.dreId = turmaSelecionada.dre;
      avaliacao.turmaId = turmaSelecionada.turma;
      avaliacao.ueId = turmaSelecionada.unidadeEscolar;
    }

    const disciplinas = [];
    listaDisciplinasRegencia.forEach(disciplina => {
      if (
        !disciplinas.includes(disciplina.codigoComponenteCurricular) &&
        disciplina.selecionada
      )
        disciplinas.push(`${disciplina.codigoComponenteCurricular}`);
    });
    avaliacao.disciplinaContidaRegenciaId = disciplinas;

    avaliacao.dataAvaliacao = window.moment(dataAvaliacao).format();
    avaliacao.descricao = descricao;

    dados.disciplinasId = Array.isArray(dados.disciplinasId)
      ? [...dados.disciplinasId]
      : [dados.disciplinasId];

    const dadosValidacao = {
      ...dados,
      ...avaliacao,
      turmasParaCopiar: copias.map(z => ({
        turmaId: z.turmaId,
        dataAtividadeAvaliativa: z.dataAvaliacao,
      })),
    };

    delete dadosValidacao.categoriaId;
    delete dadosValidacao.descricao;

    if (descricao.length <= 500) {
      const validacao = await ServicoAvaliacao.validar(dadosValidacao);

      if (validacao && validacao.status === 200) {
        const salvar = await ServicoAvaliacao.salvar(idAvaliacao, {
          ...dados,
          ...avaliacao,
          turmasParaCopiar: copias.map(z => ({
            turmaId: z.turmaId,
            dataAtividadeAvaliativa: z.dataAvaliacao,
          })),
        });

        if (salvar && salvar.status === 200) {
          if (salvar.data && salvar.data.length) {
            salvar.data.forEach(item => {
              if (item.mensagem.includes('Erro')) {
                setCarregandoTela(false);
                erro(item.mensagem);
              } else {
                setCarregandoTela(false);
                sucesso(item.mensagem);
              }
            });
          } else {
            setCarregandoTela(false);
            sucesso(
              `Avalia????o ${idAvaliacao ? 'atualizada' : 'cadastrada'
              } com sucesso.`
            );
          }
          setCarregandoTela(false);
          history.push(RotasDTO.CALENDARIO_PROFESSOR);
        } else {
          setCarregandoTela(false);
          erro(salvar);
        }
      } else {
        setCarregandoTela(false);
        erro(validacao);
      }
    } else {
      setCarregandoTela(false);
      erro('A descri????o n??o deve ter mais de 500 caracteres');
    }
  };

  const categorias = { NORMAL: 1, INTERDISCIPLINAR: 2 };

  const montaValidacoes = categoria => {
    const ehInterdisciplinar = categoria === categorias.INTERDISCIPLINAR;
    const val = {
      categoriaId: Yup.string().required('Selecione a categoria'),
      disciplinasId: Yup.string()
        .required('Selecione o componente curricular')
        .test({
          name: 'quantidadeDisciplinas',
          exclusive: true,
          message:
            'Para categoria Interdisciplinar informe mais que um componente curricular',
          test: value => (ehInterdisciplinar ? value.length > 1 : true),
        }),
      tipoAvaliacaoId: Yup.string().required(
        'Selecione o tipo de atividade avaliativa'
      ),
      nome: Yup.string().required('Preencha o nome da atividade avaliativa'),
      descricao: Yup.string().max(
        500,
        'A descri????o n??o deve ter mais de 500 caracteres'
      ),
    };
    setValidacoes(Yup.object(val));
  };

  const [validacoes, setValidacoes] = useState(undefined);

  const [listaDisciplinas, setListaDisciplinas] = useState([]);

  const [listaCategorias, setListaCategorias] = useState([
    { label: 'Normal', value: categorias.NORMAL },
    {
      label: 'Interdisciplinar',
      value: categorias.INTERDISCIPLINAR,
      disabled: true,
    },
  ]);

  const campoNomeRef = useRef(null);
  const textEditorRef = useRef(null);

  const aoTrocarTextEditor = valor => {
    setDescricao(valor);
    aoTrocarCampos();
  };

  const [dadosAvaliacao, setDadosAvaliacao] = useState();
  const inicial = {
    categoriaId: 1,
    disciplinasId: undefined,
    disciplinaContidaRegenciaId: [],
    nome: '',
    tipoAvaliacaoId: undefined,
  };

  const clicouBotaoCancelar = form => {
    if (!idAvaliacao) {
      form.resetForm();
      setDadosAvaliacao(inicial);
      aoTrocarTextEditor('');
    }
  };

  const obterDisciplinas = async () => {
    try {
      setCarregandoTela(true);
      const { data } = await ServicoAvaliacao.listarDisciplinas(
        usuario.rf,
        turmaId
      );
      if (data) {
        setListaDisciplinas(data);
        if (data.length > 1) {
          listaCategorias.map(categoria => {
            if (categoria.value === categorias.INTERDISCIPLINAR) {
              categoria.disabled = false;
            }
          });
          setListaCategorias([...listaCategorias]);
        }
        setCarregandoTela(false);
      }
    } catch (error) {
      setCarregandoTela(false);
      erro(`N??o foi poss??vel obter o componente curricular do EOL.`);
    }
  };

  const [disciplinaDesabilitada, setDisciplinaDesabilitada] = useState(false);
  const [temRegencia, setTemRegencia] = useState(false);

  const obterDisciplinasRegencia = async () => {
    try {
      setCarregandoTela(true);
      const { data, status } = await ServicoAvaliacao.listarDisciplinasRegencia(
        turmaId
      );
      if (data && status === 200) {
        setListaDisciplinasRegencia(data);
        setTemRegencia(true);
        setCarregandoTela(false);
      }
    } catch (error) {
      setCarregandoTela(false);
      erro(`N??o foi possivel obter os componentes de reg??ncia.`);
    }
  };

  useEffect(() => {
    if (!idAvaliacao && listaDisciplinas.length === 1) {
      if (listaDisciplinas[0].regencia) {
        setTemRegencia(true);
        obterDisciplinasRegencia();
      }
      setDadosAvaliacao({
        ...dadosAvaliacao,
        disciplinasId: listaDisciplinas[0].codigoComponenteCurricular.toString(),
      });
      setDisciplinaDesabilitada(true);
      setPodeLancaNota(listaDisciplinas[0].lancaNota);
      setDisciplinaSelecionada(listaDisciplinas[0].codigoComponenteCurricular);
    }
  }, [listaDisciplinas]);

  const [listaTiposAvaliacao, setListaTiposAvaliacao] = useState([]);

  const obterlistaTiposAvaliacao = async () => {
    const tipos = await ServicoAvaliacao.listarTipos();
    if (tipos.data && tipos.data.items) {
      const lista = [];
      tipos.data.items.forEach(tipo => {
        lista.push({ nome: tipo.nome, id: tipo.id });
      });
      setListaTiposAvaliacao(lista);
    }
  };

  const validaF5 = () => {
    // TODO
    // Manter enquanto n??o ?? realizado o refactor da tela e do calend??rio!
    // Somente quando for novo registro, ao dar F5 a p??gina perde a data selecionada no calend??rio do professor!
    setCarregandoTela(true);
    setTimeout(() => {
      setCarregandoTela(false);
      history.push(RotasDTO.CALENDARIO_PROFESSOR);
    }, 2000);
  };

  useEffect(() => {
    montaValidacoes(categorias.NORMAL);
    obterDisciplinas();
    obterlistaTiposAvaliacao();

    if (!idAvaliacao) setDadosAvaliacao(inicial);

    if (match?.params?.id) {
      setIdAvaliacao(match.params.id);
    } else if (diaAvaliacao) {
      setDataAvaliacao(window.moment(diaAvaliacao));
    } else if (!valorNuloOuVazio(location.search)) {
      const query = queryString.parse(location.search);
      setDataAvaliacao(window.moment(query.diaAvaliacao));
    } else {
      validaF5();
    }
  }, []);

  const validaInterdisciplinar = categoriaSelecionada => {
    if (categoriaSelecionada == categorias.INTERDISCIPLINAR) {
      setCopias([]);
      setDesabilitarCopiarAvaliacao(true);
    } else {
      setDesabilitarCopiarAvaliacao(false);
    }
  };

  const obterAvaliacao = async () => {
    try {
      setCarregandoTela(true);
      const avaliacao = await ServicoAvaliacao.buscar(idAvaliacao);
      if (avaliacao && avaliacao.data) {
        setDataAvaliacao(window.moment(avaliacao.data.dataAvaliacao));
        setListaDisciplinasSelecionadas(avaliacao.data.disciplinasId);
        setDisciplinaSelecionada(avaliacao.data.disciplinasId[0]);
        validaInterdisciplinar(avaliacao.data.categoriaId);
        const tipoAvaliacaoId = avaliacao.data.tipoAvaliacaoId.toString();
        setDadosAvaliacao({ ...avaliacao.data, tipoAvaliacaoId });
        setDescricao(avaliacao.data.descricao);
        setInseridoAlterado({
          alteradoEm: avaliacao.data.alteradoEm,
          alteradoPor: `${avaliacao.data.alteradoPor} (${avaliacao.data.alteradoRF})`,
          criadoEm: avaliacao.data.criadoEm,
          criadoPor: `${avaliacao.data.criadoPor} (${avaliacao.data.criadoRF})`,
        });
        setDentroPeriodo(avaliacao.data.dentroPeriodo);
        if (
          avaliacao.data.atividadesRegencia &&
          avaliacao.data.atividadesRegencia.length > 0
        ) {
          obterDisciplinasRegencia();
        }
        setCarregandoTela(false);
      }
    } catch (error) {
      setCarregandoTela(false);
      erro(`N??o foi poss??vel obter avalia????o!`);
    }
  };

  useEffect(() => {
    if (
      idAvaliacao &&
      !ehTurmaInfantil(modalidadesFiltroPrincipal, turmaSelecionada)
    )
      obterAvaliacao();
  }, [idAvaliacao]);

  useEffect(() => {
    const turmaInfantil = ehTurmaInfantil(
      modalidadesFiltroPrincipal,
      turmaSelecionada
    );
    setDesabilitarCampos(turmaInfantil);

    if (turmaInfantil && refForm && refForm.resetForm) {
      refForm.resetForm();
      setDescricao('');
      setModoEdicao(false);
    }
  }, [turmaSelecionada, modalidadesFiltroPrincipal, refForm, inicial]);

  const selecionarDisciplina = indice => {
    const disciplinas = [...listaDisciplinasRegencia];
    disciplinas[indice].selecionada = !disciplinas[indice].selecionada;
    setListaDisciplinasRegencia(disciplinas);
    aoTrocarCampos();
  };

  useEffect(() => {
    if (
      temRegencia &&
      listaDisciplinasRegencia &&
      listaDisciplinasRegencia.length > 0 &&
      dadosAvaliacao &&
      dadosAvaliacao.atividadesRegencia &&
      dadosAvaliacao.atividadesRegencia.length > 0
    ) {
      const disciplinas = [...listaDisciplinasRegencia];
      listaDisciplinasRegencia.forEach((item, indice) => {
        const disciplina = dadosAvaliacao.atividadesRegencia.filter(
          atividade => {
            return (atividade.disciplinaContidaRegenciaId == item.codigoComponenteCurricular);
          }
        );
        if (disciplina && disciplina.length)
          disciplinas[indice].selecionada = true;
      });
      setListaDisciplinasRegencia(disciplinas);
    }
  }, [temRegencia]);

  const resetDisciplinasSelecionadas = form => {
    setListaDisciplinasSelecionadas([]);
    form.values.disciplinasId = [];
  };

  const renderDataAvaliacao = useCallback(() => {
    return `${dataAvaliacao?.format('dddd')}, ${dataAvaliacao?.format(
      'DD/MM/YYYY'
    )}`;
  }, [dataAvaliacao]);

  return (
    <>
      <div className="col-md-12">
        {!podeLancaNota ? (
          <Alert
            alerta={{
              tipo: 'warning',
              id: 'cadastro-aula-nao-lanca-nota',
              mensagem:
                'Este componente curricular n??o permite cadastrar avalia????o.',
              estiloTitulo: { fontSize: '18px' },
            }}
            className="mb-2"
          />
        ) : null}
      </div>
      <Div className="col-12">
        <div className="col-md-12">
          {!dentroPeriodo ? (
            <Alert
              alerta={{
                tipo: 'warning',
                id: 'alerta-perido-fechamento',
                mensagem:
                  'Apenas ?? poss??vel consultar este registro pois o per??odo n??o est?? em aberto.',
                estiloTitulo: { fontSize: '18px' },
              }}
              className="mb-2"
            />
          ) : (
              ''
            )}
        </div>
        {mostrarModalCopiarAvaliacao ? (
          <ModalCopiarAvaliacao
            show={mostrarModalCopiarAvaliacao}
            onClose={() => setMostrarModalCopiarAvaliacao(false)}
            disciplina={disciplinaSelecionada}
            onSalvarCopias={copiasAvaliacoes => {
              setCopias(copiasAvaliacoes);
              setModoEdicao(true);
            }}
          />
        ) : (
            ''
          )}
        <AlertaModalidadeInfantil />
        <Grid cols={12} className="mb-1 p-0">
          <Titulo className="font-weight-bold">
            {`Cadastro de avalia????o - ${renderDataAvaliacao()}`}
          </Titulo>
        </Grid>
        <Loader loading={carregandoTela} tip="Carregando...">
          <Formik
            enableReinitialize
            ref={refForm => setRefForm(refForm)}
            initialValues={dadosAvaliacao}
            onSubmit={dados => cadastrarAvaliacao(dados)}
            validationSchema={validacoes}
            validateOnBlur={false}
            validateOnChange={false}
          >
            {form => (
              <Card className="rounded mb-4 mx-auto">
                <Grid cols={12} className="d-flex justify-content-end mb-3">
                  <Button
                    label="Voltar"
                    icon="arrow-left"
                    color={Colors.Azul}
                    onClick={clicouBotaoVoltar}
                    border
                    className="mr-3"
                  />
                  <Button
                    label="Cancelar"
                    color={Colors.Roxo}
                    onClick={() => clicouBotaoCancelar(form)}
                    border
                    bold
                    className="mr-3"
                    disabled={
                      desabilitarCampos || !dentroPeriodo || !modoEdicao
                    }
                  />
                  <Button
                    label="Excluir"
                    color={Colors.Vermelho}
                    border
                    className="mr-3"
                    disabled={
                      desabilitarCampos ||
                      !idAvaliacao ||
                      (permissaoTela && !permissaoTela.podeAlterar) ||
                      !dentroPeriodo
                    }
                    onClick={clicouBotaoExcluir}
                  />
                  <Button
                    label={idAvaliacao ? 'Alterar' : 'Cadastrar'}
                    color={Colors.Roxo}
                    onClick={e => clicouBotaoCadastrar(form, e)}
                    ref={botaoCadastrarRef}
                    disabled={
                      desabilitarCampos ||
                      (permissaoTela &&
                        (!permissaoTela.podeIncluir ||
                          !permissaoTela.podeAlterar)) ||
                      !dentroPeriodo ||
                      !modoEdicao ||
                      !podeLancaNota
                    }
                    border
                    bold
                  />
                </Grid>
                <Form>
                  <Div className="row">
                    <Grid cols={12} className="mb-4">
                      <RadioGroupButton
                        id="categoriaId"
                        name="categoriaId"
                        label="Categoria"
                        opcoes={listaCategorias}
                        form={form}
                        onChange={e => {
                          aoTrocarCampos();
                          resetDisciplinasSelecionadas(form);
                          montaValidacoes(e.target.value);
                          validaInterdisciplinar(e.target.value);
                        }}
                        desabilitado={desabilitarCampos || !dentroPeriodo}
                      />
                    </Grid>
                  </Div>
                  {temRegencia && listaDisciplinasRegencia && (
                    <Div className="row">
                      <Grid cols={12} className="mb-4">
                        <Label text="Componente curricular" />
                        {listaDisciplinasRegencia.map((disciplina, indice) => {
                          return (
                            <Badge
                              key={disciplina.codigoComponenteCurricular}
                              role="button"
                              onClick={e => {
                                e.preventDefault();
                                selecionarDisciplina(indice);
                              }}
                              aria-pressed={disciplina.selecionada && true}
                              alt={disciplina.nome}
                              className="badge badge-pill border text-dark bg-white font-weight-light px-2 py-1 mr-2"
                            >
                              {disciplina.nome}
                            </Badge>
                          );
                        })}
                      </Grid>
                    </Div>
                  )}
                  <Div className="row">
                    {!temRegencia && (
                      <Grid cols={4} className="mb-4">
                        {listaDisciplinas.length > 1 &&
                          form.values.categoriaId ===
                          categorias.INTERDISCIPLINAR ? (
                            <SelectComponent
                              id="disciplinasId"
                              name="disciplinasId"
                              label="Componente curricular"
                              lista={listaDisciplinas}
                              valueOption="codigoComponenteCurricular"
                              valueText="nome"
                              disabled={
                                desabilitarCampos ||
                                !dentroPeriodo ||
                                disciplinaDesabilitada
                              }
                              placeholder="Selecione um componente curricular"
                              valueSelect={listaDisciplinasSelecionadas}
                              form={form}
                              multiple
                              onChange={onChangeDisciplina}
                            />
                          ) : (
                            <SelectComponent
                              id="disciplinasId"
                              name="disciplinasId"
                              label="Componente curricular"
                              lista={listaDisciplinas}
                              valueOption="codigoComponenteCurricular"
                              valueText="nome"
                              disabled={
                                desabilitarCampos ||
                                !dentroPeriodo ||
                                disciplinaDesabilitada
                              }
                              placeholder="Selecione um componente curricular"
                              form={form}
                              onChange={valor => {
                                setDisciplinaSelecionada(valor);
                                onChangeDisciplina(valor);
                              }}
                              valueSelect={disciplinaSelecionada}
                            />
                          )}
                      </Grid>
                    )}
                    <Grid cols={!temRegencia ? 4 : 6} className="mb-4">
                      <SelectComponent
                        id="tipoAvaliacaoId"
                        name="tipoAvaliacaoId"
                        label="Tipo de Atividade Avaliativa"
                        lista={listaTiposAvaliacao}
                        valueOption="id"
                        valueText="nome"
                        placeholder="Atividade Avaliativa"
                        form={form}
                        onChange={aoTrocarCampos}
                        disabled={desabilitarCampos || !dentroPeriodo}
                      />
                    </Grid>
                    <Grid cols={!temRegencia ? 4 : 6} className="mb-4">
                      <Label text="Nome da Atividade Avaliativa" />
                      <CampoTexto
                        name="nome"
                        id="nome"
                        maxlength={50}
                        placeholder="Nome"
                        type="input"
                        form={form}
                        ref={campoNomeRef}
                        onChange={e => {
                          form.setFieldValue('nome', e.target.value);
                          aoTrocarCampos();
                        }}
                        desabilitado={desabilitarCampos || !dentroPeriodo}
                      />
                    </Grid>
                  </Div>
                  <Div className="row">
                    <Grid cols={12}>
                      <JoditEditor
                        label="Descri????o"
                        form={form}
                        value={form.values.descricao}
                        name="descricao"
                        id="descricao"
                        onChange={aoTrocarTextEditor}
                        desabilitar={desabilitarCampos || !dentroPeriodo}
                        permiteInserirArquivo={false}
                      />
                    </Grid>
                  </Div>
                  <Div className="row" style={{ marginTop: '14px' }}>
                    <Grid
                      style={{ display: 'flex', justifyContent: 'flex-start' }}
                      cols={12}
                    >
                      <Button
                        label="Copiar avalia????o"
                        icon="clipboard"
                        color={Colors.Azul}
                        border
                        className="btnGroupItem"
                        onClick={() => setMostrarModalCopiarAvaliacao(true)}
                        disabled={
                          desabilitarCampos ||
                          !dentroPeriodo ||
                          desabilitarCopiarAvaliacao
                        }
                      />
                      {copias.length > 0 && (
                        <div style={{ marginLeft: '14px' }}>
                          <span>Avalia????o ser?? copiada para: </span>
                          <br />
                          {copias.map(x => (
                            <span style={{ display: 'block' }}>
                              <strong>Turma:</strong> &nbsp;
                              {x.turma[0].desc} <strong>Data: &nbsp;</strong>
                              {window
                                .moment(x.dataAvaliacao)
                                .format('DD/MM/YYYY')}
                            </span>
                          ))}
                        </div>
                      )}
                    </Grid>
                  </Div>
                </Form>
                <Div className="row">
                  <Grid cols={12}>
                    <InseridoAlterado className="mt-4">
                      {inseridoAlterado.criadoPor &&
                        inseridoAlterado.criadoEm ? (
                          <p className="pt-2">
                            INSERIDO por {inseridoAlterado.criadoPor} em{' '}
                            {window.moment(inseridoAlterado.criadoEm).format()}
                          </p>
                        ) : (
                          ''
                        )}

                      {inseridoAlterado.alteradoPor &&
                        inseridoAlterado.alteradoEm ? (
                          <p>
                            ALTERADO por {inseridoAlterado.alteradoPor} em{' '}
                            {window.moment(inseridoAlterado.alteradoEm).format()}
                          </p>
                        ) : (
                          ''
                        )}
                    </InseridoAlterado>
                  </Grid>
                </Div>
              </Card>
            )}
          </Formik>
        </Loader>
      </Div>
    </>
  );
};

AvaliacaoForm.propTypes = {
  match: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  location: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

AvaliacaoForm.defaultProps = {
  match: {},
  location: {},
};

export default AvaliacaoForm;
