import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import shortid from 'shortid';
import { Checkbox } from 'antd';
import {
  selecionarTurma,
  turmasUsuario,
  removerTurma,
  setarConsideraHistorico,
} from '~/redux/modulos/usuario/actions';
import Grid from '~/componentes/grid';
import Button from '~/componentes/button';
import { Colors } from '~/componentes/colors';
import SelectComponent from '~/componentes/select';
import api from '~/servicos/api';
import {
  Container,
  Campo,
  Busca,
  Fechar,
  SetaFunction,
  ItemLista,
} from './index.css';
import {
  salvarAnosLetivos,
  salvarModalidades,
  salvarPeriodos,
  salvarDres,
  salvarUnidadesEscolares,
  salvarTurmas,
  limparDadosFiltro,
} from '~/redux/modulos/filtro/actions';
import FiltroHelper from './helper';
import { erro } from '~/servicos/alertas';
import modalidade from '~/dtos/modalidade';
import ServicoFiltro from '~/servicos/Componentes/ServicoFiltro';
import { Loader } from '~/componentes';
import { TOKEN_EXPIRADO } from '~/constantes';

const Filtro = () => {
  const dispatch = useDispatch();
  const [alternarFocoCampo, setAlternarFocoCampo] = useState(false);
  const [alternarFocoBusca, setAlternarFocoBusca] = useState(false);

  const Seta = SetaFunction(alternarFocoBusca);

  const divBuscaRef = useRef();
  const campoBuscaRef = useRef();

  const [carregandoModalidades, setCarregandoModalidades] = useState(false);
  const [carregandoPeriodos, setCarregandoPeriodos] = useState(false);
  const [carregandoDres, setCarregandoDres] = useState(false);
  const [carregandoUes, setCarregandoUes] = useState(false);
  const [carregandoTurmas, setCarregandoTurmas] = useState(false);

  const usuarioStore = useSelector(state => state.usuario);
  const perfilStore = useSelector(state => state.perfil);
  const turmaUsuarioSelecionada = usuarioStore.turmaSelecionada;
  const [campoAnoLetivoDesabilitado, setCampoAnoLetivoDesabilitado] = useState(
    true
  );
  const [
    campoModalidadeDesabilitado,
    setCampoModalidadeDesabilitado,
  ] = useState(true);
  const [campoPeriodoDesabilitado, setCampoPeriodoDesabilitado] = useState(
    true
  );
  const [campoDreDesabilitado, setCampoDreDesabilitado] = useState(true);
  const [
    campoUnidadeEscolarDesabilitado,
    setCampoUnidadeEscolarDesabilitado,
  ] = useState(true);
  const [campoTurmaDesabilitado, setCampoTurmaDesabilitado] = useState(true);

  const anosLetivoStore = useSelector(state => state.filtro.anosLetivos);
  const [anosLetivos, setAnosLetivos] = useState(anosLetivoStore || []);
  const [anoLetivoSelecionado, setAnoLetivoSelecionado] = useState(
    turmaUsuarioSelecionada ? turmaUsuarioSelecionada.anoLetivo : ''
  );

  const modalidadesStore = useSelector(state => state.filtro.modalidades);
  const [modalidades, setModalidades] = useState(modalidadesStore);
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState(
    turmaUsuarioSelecionada ? turmaUsuarioSelecionada.modalidade : ''
  );

  const periodosStore = useSelector(state => state.filtro.periodos);
  const [periodos, setPeriodos] = useState(periodosStore);
  const [periodoSelecionado, setPeriodoSelecionado] = useState(
    turmaUsuarioSelecionada ? turmaUsuarioSelecionada.periodo : ''
  );

  const dresStore = useSelector(state => state.filtro.dres);
  const [dres, setDres] = useState(dresStore);
  const [dreSelecionada, setDreSelecionada] = useState(
    turmaUsuarioSelecionada ? turmaUsuarioSelecionada.dre : ''
  );
  const [aplicouFiltro, setAplicouFiltro] = useState(false);

  const unidadesEscolaresStore = useSelector(
    state => state.filtro.unidadesEscolares
  );
  const [unidadesEscolares, setUnidadesEscolares] = useState(
    unidadesEscolaresStore
  );
  const [unidadeEscolarSelecionada, setUnidadeEscolarSelecionada] = useState(
    turmaUsuarioSelecionada ? turmaUsuarioSelecionada.unidadeEscolar : ''
  );

  const turmasStore = useSelector(state => state.filtro.turmas);
  const [turmas, setTurmas] = useState(turmasStore);
  const [turmaSelecionada, setTurmaSelecionada] = useState(
    turmaUsuarioSelecionada ? turmaUsuarioSelecionada.turma : ''
  );

  const [textoAutocomplete, setTextoAutocomplete] = useState(
    turmaUsuarioSelecionada ? turmaUsuarioSelecionada.desc : ''
  );
  const [resultadosFiltro, setResultadosFiltro] = useState([]);

  const [consideraHistorico, setConsideraHistorico] = useState(
    turmaUsuarioSelecionada && !!turmaUsuarioSelecionada.consideraHistorico
  );

  const aplicarFiltro = useCallback(() => {
    if (
      anoLetivoSelecionado &&
      modalidadeSelecionada &&
      dreSelecionada &&
      unidadeEscolarSelecionada &&
      turmaSelecionada
    ) {
      const modalidadeDesc = modalidades.find(
        item => item.valor.toString() === `${modalidadeSelecionada}`
      );

      const turmaAtual = turmas.find(turma => turma.valor === turmaSelecionada);

      const unidadeEscolarDesc = unidadesEscolares.find(
        unidade => unidade.valor === unidadeEscolarSelecionada
      );

      setTextoAutocomplete(
        `${modalidadeDesc ? modalidadeDesc.desc : 'Modalidade'} - ${
          turmaAtual ? turmaAtual.desc : 'Turma'
        } - ${unidadeEscolarDesc ? unidadeEscolarDesc.desc : 'Unidade Escolar'}`
      );

      setAlternarFocoBusca(false);
      setAplicouFiltro(true);

      const turmaSelecionadaCompleta = turmas.find(
        item => item.valor.toString() === turmaSelecionada
      );
      if (!turmaSelecionadaCompleta) return;
      const turma = {
        anoLetivo: anoLetivoSelecionado,
        modalidade: modalidadeSelecionada,
        dre: dreSelecionada,
        unidadeEscolar: unidadeEscolarSelecionada,
        turma: turmaSelecionada,
        ano: turmaSelecionadaCompleta.ano,
        desc: `${
          modalidadeDesc && modalidadeDesc.desc ? modalidadeDesc.desc : ''
        } - ${turmaAtual && turmaAtual.desc ? turmaAtual.desc : ''} - ${
          unidadeEscolarDesc && unidadeEscolarDesc.desc
            ? unidadeEscolarDesc.desc
            : ''
        }`,
        periodo: periodoSelecionado || 0,
        consideraHistorico,
        ensinoEspecial: turmaAtual.ensinoEspecial,
        id: turmaAtual.id,
      };

      dispatch(turmasUsuario(turmas));
      dispatch(selecionarTurma(turma));

      setTextoAutocomplete(turma.desc);
    }
  }, [
    anoLetivoSelecionado,
    consideraHistorico,
    dispatch,
    dreSelecionada,
    modalidadeSelecionada,
    modalidades,
    periodoSelecionado,
    turmaSelecionada,
    turmas,
    unidadeEscolarSelecionada,
    unidadesEscolares,
  ]);

  const [podeRemoverTurma, setPodeRemoverTurma] = useState(true);

  useEffect(() => {
    if (
      anosLetivos.length === 1 &&
      anoLetivoSelecionado &&
      modalidades.length === 1 &&
      modalidadeSelecionada &&
      dres.length === 1 &&
      dreSelecionada &&
      unidadesEscolares.length === 1 &&
      unidadeEscolarSelecionada &&
      turmas.length === 1 &&
      turmaSelecionada
    ) {
      aplicarFiltro();
      setPodeRemoverTurma(false);
    }
  }, [
    anoLetivoSelecionado,
    anosLetivos.length,
    aplicarFiltro,
    dreSelecionada,
    dres.length,
    modalidadeSelecionada,
    modalidades.length,
    turmaSelecionada,
    turmas.length,
    unidadeEscolarSelecionada,
    unidadesEscolares.length,
  ]);

  const reabilitarCampos = () => {
    setCampoDreDesabilitado(false);
    setCampoAnoLetivoDesabilitado(false);
    setCampoModalidadeDesabilitado(false);
    setCampoPeriodoDesabilitado(false);
    setCampoTurmaDesabilitado(false);
    setCampoUnidadeEscolarDesabilitado(false);
    setAplicouFiltro(false);
  };

  const filtro = useSelector(state => state.filtro);

  useEffect(() => {
    setAnoLetivoSelecionado(turmaUsuarioSelecionada.anoLetivo || undefined);
    setModalidadeSelecionada(turmaUsuarioSelecionada.modalidade || undefined);
    setPeriodoSelecionado(turmaUsuarioSelecionada.periodo || undefined);
    setDreSelecionada(turmaUsuarioSelecionada.dre || undefined);
    setUnidadeEscolarSelecionada(
      turmaUsuarioSelecionada.unidadeEscolar || undefined
    );
    setTurmaSelecionada(turmaUsuarioSelecionada.turma || undefined);
    setTextoAutocomplete(turmaUsuarioSelecionada.desc || undefined);
    setConsideraHistorico(!!turmaUsuarioSelecionada.consideraHistorico);

    if (!turmaUsuarioSelecionada.length) setCampoAnoLetivoDesabilitado(false);
  }, [
    turmaUsuarioSelecionada.anoLetivo,
    turmaUsuarioSelecionada.consideraHistorico,
    turmaUsuarioSelecionada.desc,
    turmaUsuarioSelecionada.dre,
    turmaUsuarioSelecionada.length,
    turmaUsuarioSelecionada.modalidade,
    turmaUsuarioSelecionada.periodo,
    turmaUsuarioSelecionada.turma,
    turmaUsuarioSelecionada.unidadeEscolar,
  ]);

  const campoVazio = campo => {
    return !campo || campo === [] || campo === '';
  };

  /*
  Sess??o onde obtem os dados no backend

  ObterAnosLetivos
  ObterModalidade
  ObterPeriodos
  ObterDres
  ObterUnidadesEscolares
  ObterTurmas
 */

  const obterAnosLetivos = useCallback(
    async deveSalvarAnosLetivos => {
      if (!deveSalvarAnosLetivos) return;

      const anosLetivo = await FiltroHelper.obterAnosLetivos({
        consideraHistorico,
      });

      if (!anosLetivo.length) {
        const anoAtual = window.moment().format('YYYY');

        anosLetivo.push({
          desc: anoAtual,
          valor: anoAtual,
        });
      }

      dispatch(salvarAnosLetivos(anosLetivo));
      setAnosLetivos(anosLetivo);
    },
    [consideraHistorico, dispatch]
  );

  const obterModalidades = useCallback(
    async deveSalvarModalidade => {
      setCarregandoModalidades(true);

      const modalidadesLista = await FiltroHelper.obterModalidades({
        consideraHistorico,
        anoLetivoSelecionado,
      });

      if (deveSalvarModalidade) {
        setModalidades(modalidadesLista);
        dispatch(salvarModalidades(modalidadesLista));
        setCampoModalidadeDesabilitado(modalidadesLista.length === 1);
      }

      setCarregandoModalidades(false);
      return modalidadesLista;
    },
    [anoLetivoSelecionado, consideraHistorico, dispatch]
  );

  const obterPeriodos = useCallback(
    async deveSalvarPeriodos => {
      if (campoVazio(anoLetivoSelecionado) || campoVazio(modalidadeSelecionada))
        return [];

      setCarregandoPeriodos(true);

      const periodo = await FiltroHelper.obterPeriodos({
        consideraHistorico,
        modalidadeSelecionada,
        anoLetivoSelecionado,
      });

      setCarregandoPeriodos(false);

      if (!modalidade) {
        setCampoPeriodoDesabilitado(true);
        return [];
      }

      if (!deveSalvarPeriodos) return [];

      dispatch(salvarPeriodos(periodo));
      setPeriodos(periodo);
      setCampoPeriodoDesabilitado(periodo.length === 1);

      return [];
    },
    [anoLetivoSelecionado, consideraHistorico, dispatch, modalidadeSelecionada]
  );

  const obterDres = useCallback(
    async (estado, periodo) => {
      if (campoVazio(anoLetivoSelecionado) || campoVazio(modalidadeSelecionada))
        return [];

      setCarregandoDres(true);

      const listaDres = await FiltroHelper.obterDres({
        consideraHistorico,
        modalidadeSelecionada,
        periodoSelecionado: periodo,
        anoLetivoSelecionado,
      });

      if (estado) {
        dispatch(salvarDres(listaDres));
        setDres(listaDres);
        setCampoDreDesabilitado(listaDres.length === 1);
      }

      setCarregandoDres(false);
      return listaDres;
    },
    [anoLetivoSelecionado, consideraHistorico, dispatch, modalidadeSelecionada]
  );

  const obterUnidadesEscolares = useCallback(
    async (deveSalvarUes, periodo) => {
      if (
        campoVazio(anoLetivoSelecionado) ||
        campoVazio(modalidadeSelecionada) ||
        campoVazio(dreSelecionada)
      )
        return [];

      setCarregandoUes(true);

      const ues = await FiltroHelper.obterUnidadesEscolares({
        consideraHistorico,
        modalidadeSelecionada,
        dreSelecionada,
        periodoSelecionado: periodo,
        anoLetivoSelecionado,
      });

      if (!ues) {
        setDreSelecionada();
        setCampoDreDesabilitado(true);
        setCarregandoUes(false);
        erro('Esta DRE n??o possui unidades escolares da modalidade escolhida');
        return [];
      }

      if (deveSalvarUes) {
        dispatch(salvarUnidadesEscolares(ues));
        setUnidadesEscolares(ues);
        setCampoUnidadeEscolarDesabilitado(ues.length === 1);
      }

      setCarregandoUes(false);
      return ues;
    },
    [
      anoLetivoSelecionado,
      consideraHistorico,
      dispatch,
      dreSelecionada,
      modalidadeSelecionada,
    ]
  );

  const obterTurmas = useCallback(
    async deveSalvarTurmas => {
      if (
        campoVazio(anoLetivoSelecionado) ||
        campoVazio(modalidadeSelecionada) ||
        campoVazio(dreSelecionada) ||
        campoVazio(unidadeEscolarSelecionada)
      )
        return [];

      const periodo =
        (modalidadeSelecionada.toString() === modalidade.EJA.toString() &&
          periodoSelecionado) ||
        null;

      setCarregandoTurmas(true);

      let existeErroTokenExpirado = false;
      const listaTurmas = await FiltroHelper.obterTurmas({
        consideraHistorico,
        modalidadeSelecionada,
        unidadeEscolarSelecionada,
        periodoSelecionado: periodo,
        anoLetivoSelecionado,
      }).catch(e => {
        if (e?.message.indexOf(TOKEN_EXPIRADO) >= 0) {
          existeErroTokenExpirado = true;
        }
      });

      if (existeErroTokenExpirado) return [];
      if ((!listaTurmas || listaTurmas.length === 0) && aplicouFiltro) {
        setUnidadeEscolarSelecionada();
        setCampoUnidadeEscolarDesabilitado(true);
        erro('Esta unidade escolar n??o possui turmas da modalidade escolhida');
        return [];
      }

      if (deveSalvarTurmas) {
        dispatch(salvarTurmas(listaTurmas));
        setTurmas(listaTurmas);
        setCampoTurmaDesabilitado(listaTurmas.length === 1);
      }

      setCarregandoTurmas(false);
      return listaTurmas;
    },
    [
      anoLetivoSelecionado,
      consideraHistorico,
      dispatch,
      dreSelecionada,
      modalidadeSelecionada,
      periodoSelecionado,
      unidadeEscolarSelecionada,
    ]
  );

  /* Sess??o dos useEffect que buscam Anos, Modalidades, Periodos, Dres, Unidades Escolares e Turmas */

  useEffect(() => {
    let estado = true;

    obterAnosLetivos(estado && !(anosLetivos && anosLetivos.length));

    return () => {
      estado = false;
      return estado;
    };
  }, [anosLetivos, obterAnosLetivos]);

  useEffect(() => {
    let estado = true;
    const retornoEstado = () => {
      estado = false;
      return estado;
    };

    if (anoLetivoSelecionado) {
      obterModalidades(estado);
      return retornoEstado;
    }

    setModalidadeSelecionada();
    setCampoModalidadeDesabilitado(true);

    return retornoEstado;
  }, [anoLetivoSelecionado, obterModalidades]);

  useEffect(() => {
    let estado = true;
    const retornoEstado = () => {
      estado = false;
      return estado;
    };

    if (!anoLetivoSelecionado || !modalidadeSelecionada) {
      setPeriodoSelecionado();
      setDreSelecionada();
      setCampoPeriodoDesabilitado(true);
      setCampoDreDesabilitado(true);
      return retornoEstado;
    }

    if (modalidadeSelecionada.toString() === modalidade.EJA.toString()) {
      obterPeriodos(estado);
      setCampoDreDesabilitado(true);
      return retornoEstado;
    }

    obterDres(estado);
    return retornoEstado;
  }, [anoLetivoSelecionado, modalidadeSelecionada, obterDres, obterPeriodos]);

  useEffect(() => {
    let estado = true;
    const retornoEstado = () => {
      estado = false;
      return estado;
    };

    if (!anoLetivoSelecionado || !modalidadeSelecionada) {
      setPeriodoSelecionado();
      setDreSelecionada();
      setCampoPeriodoDesabilitado(true);
      setCampoDreDesabilitado(true);
      return retornoEstado;
    }

    if (modalidadeSelecionada.toString() !== modalidade.EJA.toString())
      return retornoEstado;

    if (periodoSelecionado) {
      obterDres(estado);
      return retornoEstado;
    }

    setDreSelecionada();
    setCampoDreDesabilitado(true);
    return retornoEstado;
  }, [
    anoLetivoSelecionado,
    modalidadeSelecionada,
    obterDres,
    periodoSelecionado,
  ]);

  useEffect(() => {
    let estado = true;
    const retornoEstado = () => {
      estado = false;
      return estado;
    };

    if (!anoLetivoSelecionado || !modalidadeSelecionada || !dreSelecionada) {
      setUnidadeEscolarSelecionada();
      setCampoUnidadeEscolarDesabilitado(true);
      return retornoEstado;
    }

    const periodo =
      modalidadeSelecionada.toString() === modalidade.EJA.toString() &&
      periodoSelecionado;
    obterUnidadesEscolares(estado, periodo);

    return retornoEstado;
  }, [
    anoLetivoSelecionado,
    dreSelecionada,
    modalidadeSelecionada,
    obterUnidadesEscolares,
    periodoSelecionado,
  ]);

  useEffect(() => {
    if (
      anoLetivoSelecionado &&
      modalidadeSelecionada &&
      dreSelecionada &&
      unidadeEscolarSelecionada
    ) {
      obterTurmas(true);
    }
  }, [
    anoLetivoSelecionado,
    dreSelecionada,
    modalidadeSelecionada,
    obterTurmas,
    unidadeEscolarSelecionada,
  ]);

  /* Sess??o que seleciona automaticamente no filtro se houver apenas 1 registro */

  useEffect(() => {
    if (anosLetivos && anosLetivos.length === 1) {
      setAnoLetivoSelecionado(anosLetivos[0].valor);
    }
    setCampoAnoLetivoDesabilitado(anosLetivos && anosLetivos.length === 1);
  }, [anosLetivos]);

  useEffect(() => {
    if (modalidades && modalidades.length === 1) {
      setModalidadeSelecionada(modalidades[0].valor);
      setCampoModalidadeDesabilitado(true);
    }
  }, [modalidades]);

  useEffect(() => {
    if (periodos && periodos.length === 1)
      setPeriodoSelecionado(periodos[0].valor);
  }, [periodos]);

  useEffect(() => {
    if (dres && dres.length === 1) setDreSelecionada(dres[0].valor);
  }, [dres]);

  useEffect(() => {
    if (unidadesEscolares && unidadesEscolares.length === 1)
      setUnidadeEscolarSelecionada(unidadesEscolares[0].valor);
  }, [unidadesEscolares]);

  useEffect(() => {
    if (turmas && turmas.length === 1) setTurmaSelecionada(turmas[0].valor);
    else if (turmas && turmas.length > 1) {
      setCampoTurmaDesabilitado(false);
    }
  }, [turmas]);

  useEffect(() => {
    dispatch(limparDadosFiltro());
    obterAnosLetivos(true);
  }, [consideraHistorico, dispatch, obterAnosLetivos]);

  const limparCamposSelecionados = useCallback(() => {
    setAnoLetivoSelecionado('');
    setModalidadeSelecionada('');
    setDreSelecionada('');
    setPeriodoSelecionado('');
    setUnidadeEscolarSelecionada('');
    setTurmaSelecionada('');
    setAplicouFiltro(false);
  }, []);

  const aoSelecionarHistorico = () => {
    setConsideraHistorico(!consideraHistorico);
    limparCamposSelecionados();
  };

  const limparFiltro = useCallback(() => {
    dispatch(limparDadosFiltro());
    dispatch(removerTurma());
    limparCamposSelecionados();
    setTextoAutocomplete('');
    obterAnosLetivos(true);
  }, [dispatch, limparCamposSelecionados, obterAnosLetivos]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recarregarFiltro = useCallback(async () => {
    if (usuarioStore && usuarioStore.ehProfessorCj) {
      if (
        usuarioStore.turmaSelecionada &&
        usuarioStore.turmaSelecionada.turma &&
        usuarioStore.turmasUsuario &&
        usuarioStore.turmasUsuario.length
      ) {
        const turmaBkp = { ...usuarioStore.turmaSelecionada };
        const listaModalidades = await obterModalidades(false);

        let continuar = true;

        if (listaModalidades && listaModalidades.length) {
          const modalidadeNaLista = listaModalidades.find(
            item => String(item.valor) === String(turmaBkp.modalidade)
          );
          if (!modalidadeNaLista) {
            limparFiltro();
            continuar = false;
          }
        }
        if (!continuar) {
          return;
        }

        const listaDres = await obterDres(false, turmaBkp.periodo);
        if (listaDres && listaDres.length) {
          const dreNaLista = listaDres.find(
            item => String(item.valor) === String(turmaBkp.dre)
          );
          if (!dreNaLista) {
            limparFiltro();
            continuar = false;
          }
        }
        if (!continuar) {
          return;
        }

        const periodo =
          turmaBkp.modalidade.toString() === modalidade.EJA.toString()
            ? turmaBkp.periodo
            : null;
        const listaUes = await obterUnidadesEscolares(false, periodo);
        if (listaUes && listaUes.length) {
          const ueNaLista = listaUes.find(
            item => String(item.valor) === String(turmaBkp.unidadeEscolar)
          );
          if (!ueNaLista) {
            limparFiltro();
            continuar = false;
          }
        }
        if (!continuar) {
          return;
        }

        const listaTurmas = await obterTurmas(false);
        if (listaTurmas && listaTurmas.length) {
          const turmaNaLista = listaTurmas.find(
            item => String(item.valor) === String(turmaBkp.turma)
          );
          if (!turmaNaLista) {
            limparFiltro();
            continuar = false;
          }
        }
        if (!continuar) {
          return;
        }

        // MODALIDADES
        setModalidades(listaModalidades);
        dispatch(salvarModalidades(listaModalidades));
        setCampoModalidadeDesabilitado(listaModalidades.length === 1);

        // DRES
        dispatch(salvarDres(listaDres));
        setDres(listaDres);
        setCampoDreDesabilitado(listaDres.length === 1);

        // UES
        dispatch(salvarUnidadesEscolares(listaUes));
        setUnidadesEscolares(listaUes);
        setCampoUnidadeEscolarDesabilitado(listaUes.length === 1);

        // TURMAS
        dispatch(salvarTurmas(listaTurmas));
        setTurmas(listaTurmas);
        setCampoTurmaDesabilitado(listaTurmas.length === 1);
      } else {
        limparFiltro();
      }
    } else if (
      !(usuarioStore.turmaSelecionada && usuarioStore.turmaSelecionada.turma)
    ) {
      limparFiltro();
    }
  }, [perfilStore]);

  useEffect(() => {
    recarregarFiltro();
  }, [perfilStore, recarregarFiltro]);

  const mostrarEsconderBusca = () => {
    setAlternarFocoBusca(!alternarFocoBusca);
    setAlternarFocoCampo(false);
  };

  useEffect(() => {
    const controlaClickFora = evento => {
      if (
        evento.target.nodeName !== 'svg' &&
        evento.target.nodeName !== 'path' &&
        !evento.target.classList.contains('fa-caret-down') &&
        !evento.target.classList.contains('ant-select-dropdown-menu-item') &&
        !evento.target.classList.contains(
          'ant-select-dropdown-menu-item-active'
        ) &&
        !evento.target.classList.contains(
          'ant-select-selection__placeholder'
        ) &&
        !evento.target.classList.contains(
          'ant-select-selection-selected-value'
        ) &&
        !evento.target.classList.contains(
          'ant-select-dropdown-menu-item-selected'
        ) &&
        divBuscaRef.current &&
        !divBuscaRef.current.contains(evento.target)
      ) {
        setAlternarFocoBusca(!alternarFocoBusca);
      }
      setAlternarFocoCampo(false);
    };

    if (!turmaUsuarioSelecionada && !alternarFocoBusca && alternarFocoCampo)
      campoBuscaRef.current.focus();
    if (alternarFocoBusca)
      document.addEventListener('click', controlaClickFora);
    return () => document.removeEventListener('click', controlaClickFora);
  }, [alternarFocoBusca, alternarFocoCampo, turmaUsuarioSelecionada]);

  useEffect(() => {
    if (!turmaUsuarioSelecionada) campoBuscaRef.current.focus();
    if (!textoAutocomplete) setResultadosFiltro([]);
  }, [textoAutocomplete, turmaUsuarioSelecionada]);

  useEffect(() => {
    if (!turmaUsuarioSelecionada) campoBuscaRef.current.focus();
  }, [resultadosFiltro, turmaUsuarioSelecionada]);

  const onChangeAutocomplete = () => {
    const texto = campoBuscaRef.current.value;
    setTextoAutocomplete(texto);

    if (texto.length >= 2) {
      api
        .get(`v1/abrangencias/${consideraHistorico}/${texto}`)
        .then(resposta => {
          if (resposta.data) {
            setResultadosFiltro(resposta.data);
          }
        });
    }
  };

  const selecionaTurmaAutocomplete = resultado => {
    setTextoAutocomplete(resultado.descricaoFiltro);
    const turma = {
      anoLetivo: resultado.anoLetivo,
      modalidade: resultado.codigoModalidade,
      dre: resultado.codigoDre,
      unidadeEscolar: resultado.codigoUe,
      turma: resultado.codigoTurma,
      desc: resultado.descricaoFiltro,
      periodo: resultado.semestre,
      consideraHistorico,
      ano: resultado.ano,
      ensinoEspecial: resultado.ensinoEspecial,
      id: resultado.turmaId,
    };

    dispatch(selecionarTurma(turma));
    dispatch(turmasUsuario(turmas));

    setResultadosFiltro([]);
  };

  let selecionado = -1;

  const aoPressionarTeclaBaixoAutocomplete = evento => {
    if (resultadosFiltro && resultadosFiltro.length > 0) {
      const resultados = document.querySelectorAll('.list-group-item');
      if (resultados && resultados.length > 0) {
        if (evento.key === 'ArrowUp') {
          if (selecionado > 0) selecionado -= 1;
        } else if (evento.key === 'ArrowDown') {
          if (selecionado < resultados.length - 1) selecionado += 1;
        }
        resultados.forEach(resultado =>
          resultado.classList.remove('selecionado')
        );
        if (resultados[selecionado]) {
          resultados[selecionado].classList.add('selecionado');
          campoBuscaRef.current.focus();
        }
      }
    }
  };

  const aoSubmeterAutocomplete = evento => {
    evento.preventDefault();
    Filtrar();
  };

  const Filtrar = () => {
    if (resultadosFiltro) {
      if (resultadosFiltro.length === 1) {
        setModalidadeSelecionada(
          resultadosFiltro[0].codigoModalidade.toString()
        );
        setDreSelecionada(resultadosFiltro[0].codigoDre);
        setUnidadeEscolarSelecionada(resultadosFiltro[0].codigoUe);
        setTurmaSelecionada(resultadosFiltro[0].codigoTurma);
        selecionaTurmaAutocomplete(resultadosFiltro[0]);
      } else {
        const itemSelecionado = document.querySelector(
          '.list-group-item.selecionado'
        );
        if (itemSelecionado) {
          const indice = itemSelecionado.getAttribute('tabindex');
          if (indice) {
            const resultado = resultadosFiltro[indice];
            if (resultado) {
              setModalidadeSelecionada(resultado.codigoModalidade.toString());
              setDreSelecionada(resultado.codigoDre);
              setUnidadeEscolarSelecionada(resultado.codigoUe);
              setTurmaSelecionada(resultado.codigoTurma);
              selecionaTurmaAutocomplete(resultado);
            }
          }
        }
      }
    }
  };

  const aoFocarBusca = () => {
    if (alternarFocoBusca) {
      setAlternarFocoBusca(false);
      setAlternarFocoCampo(true);
    }
  };

  const aoTrocarAnoLetivo = ano => {
    if (ano !== anoLetivoSelecionado) setModalidadeSelecionada();

    setAnoLetivoSelecionado(ano);
    setAplicouFiltro(false);
  };

  const aoTrocarModalidade = valor => {
    if (valor !== modalidadeSelecionada) {
      setDreSelecionada();
      setPeriodoSelecionado();
      setAplicouFiltro(false);
      if (turmas) {
        setTurmaSelecionada('');
        setTurmas([]);
        setCampoTurmaDesabilitado(true);
      }
    }

    setModalidadeSelecionada(valor);
  };

  const aoTrocarPeriodo = periodo => {
    if (periodo !== periodoSelecionado) {
      setDreSelecionada();
      setAplicouFiltro(false);
    }

    setPeriodoSelecionado(periodo);
  };

  const aoTrocarDre = dre => {
    if (dre !== dreSelecionada) {
      setUnidadeEscolarSelecionada();
      setAplicouFiltro(false);
      if (turmas) {
        setTurmas([]);
        setCampoTurmaDesabilitado(true);
      }
    }

    setDreSelecionada(dre);
  };

  const aoTrocarUnidadeEscolar = unidade => {
    if (unidade !== unidadeEscolarSelecionada) {
      setTurmaSelecionada();
      obterTurmas();
      setAplicouFiltro(false);
    }

    setUnidadeEscolarSelecionada(unidade);
  };

  const aoTrocarTurma = turma => {
    setAplicouFiltro(false);
    setTurmaSelecionada(turma);
  };

  const removerTurmaSelecionada = () => {
    dispatch(removerTurma());
    setModalidadeSelecionada();
    setPeriodoSelecionado();
    setDreSelecionada();
    setUnidadeEscolarSelecionada();
    setTurmaSelecionada();
    setTextoAutocomplete('');
    setAnoLetivoSelecionado();

    reabilitarCampos();
  };

  useEffect(() => {
    if (!alternarFocoBusca) {
      if (!anoLetivoSelecionado && turmaUsuarioSelecionada.length) {
        setAnoLetivoSelecionado(turmaUsuarioSelecionada.anoLetivo);
        setCampoAnoLetivoDesabilitado(false);
      }

      if (
        turmaUsuarioSelecionada.anoLetivo &&
        anoLetivoSelecionado &&
        turmaUsuarioSelecionada.anoLetivo != anoLetivoSelecionado
      )
        setAnoLetivoSelecionado(turmaUsuarioSelecionada.anoLetivo);

      if (
        turmaUsuarioSelecionada.modalidade &&
        modalidadeSelecionada &&
        turmaUsuarioSelecionada.modalidade != modalidadeSelecionada
      )
        setModalidadeSelecionada(turmaUsuarioSelecionada.modalidade);

      if (
        turmaUsuarioSelecionada.periodo &&
        periodoSelecionado &&
        turmaUsuarioSelecionada.periodo != periodoSelecionado
      )
        setPeriodoSelecionado(turmaUsuarioSelecionada.periodo);

      if (
        turmaUsuarioSelecionada.dre &&
        dreSelecionada &&
        turmaUsuarioSelecionada.dre != dreSelecionada
      )
        setDreSelecionada(turmaUsuarioSelecionada.dre);

      if (
        turmaUsuarioSelecionada.unidadeEscolar &&
        unidadeEscolarSelecionada &&
        turmaUsuarioSelecionada.unidadeEscolar &&
        unidadeEscolarSelecionada
      )
        setUnidadeEscolarSelecionada(turmaUsuarioSelecionada.unidadeEscolar);

      if (
        turmaUsuarioSelecionada.turma &&
        turmaSelecionada &&
        turmaUsuarioSelecionada.turma != turmaSelecionada
      )
        setTurmaSelecionada(turmaUsuarioSelecionada.turma);

      setTextoAutocomplete(turmaUsuarioSelecionada.desc);
      setConsideraHistorico(!!turmaUsuarioSelecionada.consideraHistorico);
    }
  }, [
    alternarFocoBusca,
    turmaUsuarioSelecionada.anoLetivo,
    turmaUsuarioSelecionada.consideraHistorico,
    turmaUsuarioSelecionada.desc,
    turmaUsuarioSelecionada.dre,
    turmaUsuarioSelecionada.length,
    turmaUsuarioSelecionada.modalidade,
    turmaUsuarioSelecionada.periodo,
    turmaUsuarioSelecionada.turma,
    turmaUsuarioSelecionada.unidadeEscolar,
  ]);

  return (
    <Container className="position-relative w-100" id="containerFiltro">
      <form className="w-100" onSubmit={aoSubmeterAutocomplete}>
        <div className="form-group mb-0 w-100 position-relative">
          <Busca className="fa fa-search fa-lg bg-transparent position-absolute text-center" />
          <Campo
            type="text"
            className="form-control form-control-lg rounded d-flex px-5 border-0 fonte-14"
            placeholder="Pesquisar Turma"
            ref={campoBuscaRef}
            onFocus={aoFocarBusca}
            onChange={onChangeAutocomplete}
            onKeyDown={aoPressionarTeclaBaixoAutocomplete}
            readOnly={!!turmaUsuarioSelecionada.turma}
            value={textoAutocomplete}
          />
          {!!turmaUsuarioSelecionada.turma && podeRemoverTurma && (
            <Fechar
              className="fa fa-times position-absolute"
              onClick={removerTurmaSelecionada}
            />
          )}
          <Seta
            className="fa fa-caret-down rounded-circle position-absolute text-center"
            onClick={mostrarEsconderBusca}
          />
        </div>
        {resultadosFiltro.length > 0 && (
          <div className="container d-block position-absolute bg-white shadow rounded mt-1 p-0">
            <div className="list-group">
              {resultadosFiltro.map((resultado, indice) => {
                return (
                  <ItemLista
                    key={shortid.generate()}
                    className="list-group-item list-group-item-action border-0 rounded-0"
                    onClick={() => selecionaTurmaAutocomplete(resultado)}
                    tabIndex={indice}
                  >
                    {resultado.descricaoFiltro}
                  </ItemLista>
                );
              })}
            </div>
          </div>
        )}
        {alternarFocoBusca && (
          <div
            ref={divBuscaRef}
            className="container d-block position-absolute bg-white shadow rounded mt-1 px-3 pt-4 pb-1"
          >
            <div className="form-row">
              <Grid cols={12} className="form-group">
                <Checkbox
                  checked={consideraHistorico}
                  onChange={aoSelecionarHistorico}
                >
                  Exibir hist??rico?
                </Checkbox>
              </Grid>
            </div>
            <div className="form-row">
              <Grid cols={3} className="form-group">
                <SelectComponent
                  className="fonte-14"
                  onChange={aoTrocarAnoLetivo}
                  lista={anosLetivos}
                  containerVinculoId="containerFiltro"
                  valueOption="valor"
                  valueText="desc"
                  valueSelect={
                    anoLetivoSelecionado && `${anoLetivoSelecionado}`
                  }
                  placeholder="Ano"
                  disabled={campoAnoLetivoDesabilitado}
                />
              </Grid>
              <Grid
                cols={
                  modalidadeSelecionada &&
                  modalidadeSelecionada.toString() === modalidade.EJA.toString()
                    ? 5
                    : 9
                }
                className="form-group"
              >
                <Loader loading={carregandoModalidades} tip="">
                  <SelectComponent
                    className="fonte-14"
                    onChange={aoTrocarModalidade}
                    lista={modalidades}
                    valueOption="valor"
                    containerVinculoId="containerFiltro"
                    valueText="desc"
                    valueSelect={
                      modalidadeSelecionada && `${modalidadeSelecionada}`
                    }
                    placeholder="Modalidade"
                    disabled={campoModalidadeDesabilitado}
                  />
                </Loader>
              </Grid>
              {modalidadeSelecionada &&
                modalidadeSelecionada.toString() ===
                  modalidade.EJA.toString() && (
                  <Grid cols={4} className="form-group">
                    <Loader loading={carregandoPeriodos} tip="">
                      <SelectComponent
                        className="fonte-14"
                        onChange={aoTrocarPeriodo}
                        lista={periodos}
                        valueOption="valor"
                        containerVinculoId="containerFiltro"
                        valueText="desc"
                        valueSelect={
                          periodoSelecionado && `${periodoSelecionado}`
                        }
                        placeholder="Per??odo"
                        disabled={campoPeriodoDesabilitado}
                      />
                    </Loader>
                  </Grid>
                )}
            </div>
            <div className="form-group">
              <Loader loading={carregandoDres} tip="">
                <SelectComponent
                  className="fonte-14"
                  onChange={aoTrocarDre}
                  lista={dres}
                  valueOption="valor"
                  containerVinculoId="containerFiltro"
                  valueText="desc"
                  valueSelect={dreSelecionada && `${dreSelecionada}`}
                  placeholder="Diretoria Regional De Educa????o (DRE)"
                  disabled={campoDreDesabilitado}
                />
              </Loader>
            </div>
            <div className="form-group">
              <Loader loading={carregandoUes} tip="">
                <SelectComponent
                  className="fonte-14"
                  onChange={aoTrocarUnidadeEscolar}
                  lista={unidadesEscolares}
                  valueOption="valor"
                  containerVinculoId="containerFiltro"
                  valueText="desc"
                  valueSelect={
                    unidadeEscolarSelecionada && `${unidadeEscolarSelecionada}`
                  }
                  placeholder="Unidade Escolar (UE)"
                  disabled={campoUnidadeEscolarDesabilitado}
                />
              </Loader>
            </div>
            <div className="form-row d-flex justify-content-between">
              <Grid cols={3} className="form-group">
                <Loader loading={carregandoTurmas} tip="">
                  <SelectComponent
                    className="fonte-14"
                    onChange={aoTrocarTurma}
                    lista={turmas}
                    valueOption="valor"
                    valueText="desc"
                    containerVinculoId="containerFiltro"
                    valueSelect={turmaSelecionada && `${turmaSelecionada}`}
                    placeholder="Turma"
                    disabled={campoTurmaDesabilitado}
                  />
                </Loader>
              </Grid>
              <Grid cols={3} className="form-group text-right">
                <Button
                  id={shortid.generate()}
                  label="Aplicar filtro"
                  color={Colors.Roxo}
                  className="ml-auto"
                  bold
                  onClick={aplicarFiltro}
                />
              </Grid>
            </div>
          </div>
        )}
      </form>
    </Container>
  );
};

export default Filtro;
