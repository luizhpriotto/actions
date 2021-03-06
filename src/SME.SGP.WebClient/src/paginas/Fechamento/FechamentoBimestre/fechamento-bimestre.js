import { Tabs } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Colors, Loader, Base } from '~/componentes';
import Cabecalho from '~/componentes-sgp/cabecalho';
import Alert from '~/componentes/alert';
import Button from '~/componentes/button';
import Card from '~/componentes/card';
import Grid from '~/componentes/grid';
import SelectComponent from '~/componentes/select';
import { ContainerTabsCard } from '~/componentes/tabs/tabs.css';
import { URL_HOME } from '~/constantes/url';
import history from '~/servicos/history';
import ServicoDisciplina from '~/servicos/Paginas/ServicoDisciplina';
import { verificaSomenteConsulta } from '~/servicos/servico-navegacao';
import FechamentoBimestreLista from './fechamento-bimestre-lista/fechamento-bimestre-lista';
import RotasDto from '~/dtos/rotasDto';
import { Fechamento } from './fechamento-bimestre.css';
import FechamentoFinal from '../FechamentoFinal/fechamentoFinal';
import ServicoFechamentoFinal from '~/servicos/Paginas/DiarioClasse/ServicoFechamentoFinal';
import { erros, sucesso, confirmar } from '~/servicos/alertas';
import ServicoFechamentoBimestre from '~/servicos/Paginas/Fechamento/ServicoFechamentoBimestre';
import periodo from '~/dtos/periodo';
import { setExpandirLinha } from '~/redux/modulos/notasConceitos/actions';
import AlertaModalidadeInfantil from '~/componentes-sgp/AlertaModalidadeInfantil/alertaModalidadeInfantil';
import modalidade from '~/dtos/modalidade';
import { ehTurmaInfantil } from '~/servicos/Validacoes/validacoesInfatil';

const FechamentoBismestre = () => {
  const dispatch = useDispatch();

  const { TabPane } = Tabs;
  const usuario = useSelector(store => store.usuario);
  const { turmaSelecionada, permissoes } = usuario;
  const permissoesTela = permissoes[RotasDto.FECHAMENTO_BIMESTRE];
  const { podeIncluir, podeAlterar } = permissoesTela;
  const [somenteConsulta, setSomenteConsulta] = useState(false);

  const modalidadesFiltroPrincipal = useSelector(
    store => store.filtro.modalidades
  );

  useEffect(() => {
    const naoSetarSomenteConsultaNoStore = ehTurmaInfantil(
      modalidadesFiltroPrincipal,
      turmaSelecionada
    );
    setSomenteConsulta(
      verificaSomenteConsulta(permissoesTela, naoSetarSomenteConsultaNoStore)
    );
  }, [turmaSelecionada, permissoesTela, modalidadesFiltroPrincipal]);

  const [carregandoDisciplinas, setCarregandoDisciplinas] = useState(false);
  const [carregandoBimestres, setCarregandoBimestres] = useState(false);
  const [listaDisciplinas, setListaDisciplinas] = useState([]);
  const [disciplinaIdSelecionada, setDisciplinaIdSelecionada] = useState(null);
  const [desabilitarDisciplina, setDesabilitarDisciplina] = useState(
    listaDisciplinas && listaDisciplinas.length === 1
  );
  const [modoEdicao, setModoEdicao] = useState(false);
  const [bimestreCorrente, setBimestreCorrente] = useState('1Bimestre');
  const [dadosBimestre1, setDadosBimestre1] = useState(undefined);
  const [dadosBimestre2, setDadosBimestre2] = useState(undefined);
  const [dadosBimestre3, setDadosBimestre3] = useState(undefined);
  const [dadosBimestre4, setDadosBimestre4] = useState(undefined);
  const [ehRegencia, setEhRegencia] = useState(false);
  const [ehSintese, setEhSintese] = useState(false);
  const [periodoFechamento, setPeriodoFechamento] = useState(periodo.Anual);
  const [situacaoFechamento, setSituacaoFechamento] = useState(0);
  const [registraFrequencia, setRegistraFrequencia] = useState(true);
  const [idDisciplinaTerritorioSaber, setIdDisciplinaTerritorioSaber] = useState(undefined);

  const resetarTela = () => {
    setBimestreCorrente('1Bimestre');
    setDadosBimestre1(undefined);
    setDadosBimestre2(undefined);
    setDadosBimestre3(undefined);
    setDadosBimestre4(undefined);
    setEhRegencia(false);
    setEhSintese(false);
    setPeriodoFechamento(periodo.Anual);
    setSituacaoFechamento(0);
    setRegistraFrequencia(true);
    setModoEdicao(false);
    setDesabilitarDisciplina(false);
    setIdDisciplinaTerritorioSaber(undefined);
  };

  const onChangeDisciplinas = id => {
    if (id) {
      const disciplina = listaDisciplinas.find(
        c => String(c.codigoComponenteCurricular) === id
        );     
        setIdDisciplinaTerritorioSaber(disciplina.territorioSaber ? disciplina.id : id);
        setDisciplinaIdSelecionada(id);
        setEhRegencia(disciplina && disciplina.regencia);      
    } else {
      setDisciplinaIdSelecionada(id);
      resetarTela();
    }
  };

  const onClickVoltar = async () => {
    let confirmou = true;
    if (modoEdicao) {
      confirmou = await confirmar(
        'Aten????o',
        'Existem altera????es pendetes, deseja realmente sair da tela de fechamento?'
      );
    }
    if (confirmou) {
      history.push(URL_HOME);
      dispatch(setExpandirLinha([]));
    }
  };

  const onClickCancelar = async () => {
    const confirmou = await confirmar(
      'Aten????o',
      'Existem altera????es pendetes, deseja realmente cancelar?'
    );
    if (confirmou) {
      refFechamentoFinal.current.cancelar();
      setModoEdicao(false);
    }
  };

  useEffect(() => {
    const obterDisciplinas = async () => {
      if (
        turmaSelecionada &&
        turmaSelecionada.turma &&
        !ehTurmaInfantil(modalidadesFiltroPrincipal, turmaSelecionada)
      ) {
        setCarregandoDisciplinas(true);
        const lista = await ServicoDisciplina.obterDisciplinasPorTurma(
          turmaSelecionada.turma
        ).catch(e => erros(e));
        if (lista && lista.data) {
          setListaDisciplinas([...lista.data]);
          if (lista.data.length === 1) {
            setDisciplinaIdSelecionada(undefined);
            setIdDisciplinaTerritorioSaber(lista.data[0].territorioSaber ? lista.data[0].id : undefined);
            setDisciplinaIdSelecionada(
              String(lista.data[0].codigoComponenteCurricular)
            );
            setEhRegencia(lista.data[0].regencia);            
            setDesabilitarDisciplina(true);
          }
        } else {
          setListaDisciplinas([]);
        }
        setCarregandoDisciplinas(false);
      }
    };
    setDisciplinaIdSelecionada(undefined);
    setIdDisciplinaTerritorioSaber(undefined);
    setListaDisciplinas([]);
    resetarTela();
    obterDisciplinas();
  }, [turmaSelecionada, modalidadesFiltroPrincipal]);

  const obterDados = async (bimestre = 0) => {
    if (disciplinaIdSelecionada) {
      setCarregandoBimestres(true);
      const fechamento = await ServicoFechamentoBimestre.buscarDados(
        turmaSelecionada.turma,
        idDisciplinaTerritorioSaber ?? disciplinaIdSelecionada,
        bimestre,
        turmaSelecionada.periodo
      ).finally(() => {
        setCarregandoBimestres(false);
      });
      if (fechamento && fechamento.data) {
        const dadosFechamento = fechamento.data;
        setEhSintese(dadosFechamento.ehSintese);
        setSituacaoFechamento(dadosFechamento.situacao);
        setPeriodoFechamento(dadosFechamento.periodo);
        setBimestreCorrente(`${dadosFechamento.bimestre}`);
        setDadosBimestre(dadosFechamento.bimestre, dadosFechamento);
      }
    }
  };

  const setDadosBimestre = (bimestre, dados) => {
    switch (bimestre) {
      case 1:
        setDadosBimestre1(undefined);
        setDadosBimestre1(dados);
        break;
      case 2:
        setDadosBimestre2(undefined);
        setDadosBimestre2(dados);
        break;
      case 3:
        setDadosBimestre3(undefined);
        setDadosBimestre3(dados);
        break;
      case 4:
        setDadosBimestre4(undefined);
        setDadosBimestre4(dados);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (disciplinaIdSelecionada) obterDados();
  }, [disciplinaIdSelecionada]);

  useEffect(() => {
    if (disciplinaIdSelecionada) {
      const disciplina = listaDisciplinas.find(
        item => String(item.codigoComponenteCurricular) == disciplinaIdSelecionada
      );      
      if (disciplina) {
        setRegistraFrequencia(disciplina.registraFrequencia);
      }
    }
  }, [disciplinaIdSelecionada, listaDisciplinas]);

  const onConfirmouTrocarTab = numeroBimestre => {
    setBimestreCorrente(numeroBimestre);
    if (numeroBimestre !== 'final') {
      obterDados(numeroBimestre);
    }
  };

  const onChangeTab = async numeroBimestre => {
    if (modoEdicao) {
      const confirmado = await confirmar(
        'Aten????o',
        'Suas altera????es n??o foram salvas, deseja salvar agora?'
      );
      if (confirmado) {
        const salvou = await salvarFechamentoFinal();
        if (salvou) {
          onConfirmouTrocarTab(numeroBimestre);
          setModoEdicao(false);
          dispatch(setExpandirLinha([]));
        }
      } else {
        onConfirmouTrocarTab(numeroBimestre);
        setModoEdicao(false);
        dispatch(setExpandirLinha([]));
      }
    } else {
      onConfirmouTrocarTab(numeroBimestre);
    }
  };

  //FechamentoFinal
  const refFechamentoFinal = useRef();
  const [turmaPrograma, setTurmaPrograma] = useState(false);

  useEffect(() => {
    const programa = !!(turmaSelecionada.ano === '0');
    setTurmaPrograma(programa);
  }, [turmaSelecionada.ano]);

  useEffect(() => {
    if (listaDisciplinas && listaDisciplinas.length > 0) {
      const disciplina = listaDisciplinas.find(
        c => c.disciplinaId == disciplinaIdSelecionada
      );
      if (disciplina) setEhRegencia(disciplina.regencia);
    }
  }, [disciplinaIdSelecionada, listaDisciplinas]);

  const [fechamentoFinal, setFechamentoFinal] = useState({
    ehRegencia,
    turmaCodigo: turmaSelecionada.turma,
    itens: [],
  });

  const onChangeFechamentoFinal = alunosAlterados => {
    const fechamentoFinalDto = fechamentoFinal;
    fechamentoFinalDto.itens = alunosAlterados;
    setFechamentoFinal(fechamentoFinalDto);
    setModoEdicao(true);
  };
  const salvarFechamentoFinal = () => {
    fechamentoFinal.turmaCodigo = turmaSelecionada.turma;
    fechamentoFinal.ehRegencia = ehRegencia;
    fechamentoFinal.disciplinaId = disciplinaIdSelecionada;
    return ServicoFechamentoFinal.salvar(fechamentoFinal)
      .then(() => {
        sucesso('Fechamento final salvo com sucesso.');
        setModoEdicao(false);
        dispatch(setExpandirLinha([]));
        refFechamentoFinal.current.salvarFechamentoFinal();
      })
      .catch(e => erros(e));
  };

  //FechamentoFinal
  return (
    <>
      {!turmaSelecionada.turma &&
      !ehTurmaInfantil(modalidadesFiltroPrincipal, usuario.turmaSelecionada) ? (
        <Grid cols={12} className="p-0">
          <Alert
            alerta={{
              tipo: 'warning',
              id: 'AlertaTurmaFechamentoBimestre',
              mensagem: 'Voc?? precisa escolher uma turma.',
              estiloTitulo: { fontSize: '18px' },
            }}
            className="mb-2"
          />
        </Grid>
      ) : null}{' '}
      <AlertaModalidadeInfantil />
      <Cabecalho pagina="Fechamento" />
      <Loader loading={carregandoBimestres}>
        <Card>
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-12 d-flex justify-content-end pb-4">
                <Button
                  id="btn-volta-fechamento-bimestre"
                  label="Voltar"
                  icon="arrow-left"
                  color={Colors.Azul}
                  border
                  className="mr-2"
                  onClick={onClickVoltar}
                />
                <Button
                  id="btn-cancelar-fechamento-bimestre"
                  label="Cancelar"
                  color={Colors.Roxo}
                  border
                  className="mr-2"
                  onClick={onClickCancelar}
                  disabled={!modoEdicao || somenteConsulta}
                  hidden={ehSintese}
                />
                <Button
                  id="btn-salvar-fechamento-bimestre"
                  label="Salvar"
                  color={Colors.Roxo}
                  border
                  bold
                  className="mr-2"
                  onClick={salvarFechamentoFinal}
                  disabled={!modoEdicao || somenteConsulta}
                  hidden={ehSintese}
                />
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="row">
              <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-4">
                <Loader loading={carregandoDisciplinas}>
                  <SelectComponent
                    id="disciplina"
                    name="disciplinaId"
                    lista={listaDisciplinas}
                    valueOption="codigoComponenteCurricular"
                    valueText="nome"
                    valueSelect={disciplinaIdSelecionada}
                    onChange={onChangeDisciplinas}
                    placeholder="Selecione um componente curricular"
                    disabled={
                      desabilitarDisciplina ||
                      !turmaSelecionada.turma ||
                      (listaDisciplinas && listaDisciplinas.length === 1)
                    }
                  />
                </Loader>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="row">
              <Fechamento className="col-sm-12 col-md-12 col-lg-12 col-xl-12 mb-2">
                <ContainerTabsCard
                  type="card"
                  onChange={onChangeTab}
                  activeKey={bimestreCorrente}
                >
                  <TabPane
                    tab="1?? Bimestre"
                    key="1"
                    disabled={!disciplinaIdSelecionada}
                  >
                    {dadosBimestre1 ? (
                      <FechamentoBimestreLista
                        dados={dadosBimestre1}
                        ehRegencia={ehRegencia}
                        ehSintese={ehSintese}
                        situacaoFechamento={situacaoFechamento}
                        codigoComponenteCurricular={idDisciplinaTerritorioSaber ?? disciplinaIdSelecionada}
                        turmaId={turmaSelecionada.turma}
                        anoLetivo={turmaSelecionada.anoLetivo}
                        registraFrequencia={registraFrequencia}
                      />
                    ) : null}
                  </TabPane>

                  <TabPane
                    tab="2?? Bimestre"
                    key="2"
                    disabled={!disciplinaIdSelecionada}
                  >
                    {dadosBimestre2 ? (
                      <FechamentoBimestreLista
                        dados={dadosBimestre2}
                        ehRegencia={ehRegencia}
                        ehSintese={ehSintese}
                        situacaoFechamento={situacaoFechamento}
                        codigoComponenteCurricular={idDisciplinaTerritorioSaber ?? disciplinaIdSelecionada}
                        turmaId={turmaSelecionada.turma}
                        anoLetivo={turmaSelecionada.anoLetivo}
                        registraFrequencia={registraFrequencia}
                      />
                    ) : null}
                  </TabPane>
                  {periodoFechamento === periodo.Anual ? (
                    <TabPane
                      tab="3?? Bimestre"
                      key="3"
                      disabled={!disciplinaIdSelecionada}
                    >
                      {dadosBimestre3 ? (
                        <FechamentoBimestreLista
                          dados={dadosBimestre3}
                          ehRegencia={ehRegencia}
                          ehSintese={ehSintese}
                          situacaoFechamento={situacaoFechamento}
                          codigoComponenteCurricular={idDisciplinaTerritorioSaber ?? disciplinaIdSelecionada}
                          turmaId={turmaSelecionada.turma}
                          anoLetivo={turmaSelecionada.anoLetivo}
                          registraFrequencia={registraFrequencia}
                        />
                      ) : null}
                    </TabPane>
                  ) : null}
                  {periodoFechamento === periodo.Anual ? (
                    <TabPane
                      tab="4?? Bimestre"
                      key="4"
                      disabled={!disciplinaIdSelecionada}
                    >
                      {dadosBimestre4 ? (
                        <FechamentoBimestreLista
                          dados={dadosBimestre4}
                          ehRegencia={ehRegencia}
                          ehSintese={ehSintese}
                          situacaoFechamento={situacaoFechamento}
                          codigoComponenteCurricular={idDisciplinaTerritorioSaber ?? disciplinaIdSelecionada}
                          turmaId={turmaSelecionada.turma}
                          anoLetivo={turmaSelecionada.anoLetivo}
                          registraFrequencia={registraFrequencia}
                        />
                      ) : null}
                    </TabPane>
                  ) : null}
                  <TabPane
                    tab="Final"
                    key="final"
                    disabled={!disciplinaIdSelecionada}
                  >
                    <FechamentoFinal
                      turmaCodigo={turmaSelecionada.turma}
                      disciplinaCodigo={idDisciplinaTerritorioSaber ?? disciplinaIdSelecionada}
                      ehRegencia={ehRegencia}
                      turmaPrograma={turmaPrograma}
                      onChange={onChangeFechamentoFinal}
                      ref={refFechamentoFinal}
                      desabilitarCampo={
                        !podeIncluir || !podeAlterar || somenteConsulta
                      }
                      somenteConsulta={somenteConsulta}
                      carregandoFechamentoFinal={carregando =>
                        setCarregandoBimestres(carregando)
                      }
                      bimestreCorrente={bimestreCorrente}
                      registraFrequencia={registraFrequencia}
                      semestre={turmaSelecionada.periodo}
                    />
                  </TabPane>
                </ContainerTabsCard>
              </Fechamento>
            </div>
          </div>
        </Card>
      </Loader>
    </>
  );
};

export default FechamentoBismestre;
