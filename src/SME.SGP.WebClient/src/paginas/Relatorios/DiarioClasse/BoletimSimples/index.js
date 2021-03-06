import React, { useEffect, useState } from 'react';

import shortid from 'shortid';
import { Loader, Card, ButtonGroup, ListaPaginada } from '~/componentes';
import { Cabecalho } from '~/componentes-sgp';

import history from '~/servicos/history';

import Filtro from './componentes/Filtro';
import ServicoBoletimSimples from '~/servicos/Paginas/Relatorios/DiarioClasse/BoletimSimples/ServicoBoletimSimples';
import { sucesso, erro } from '~/servicos/alertas';
import AlertaModalidadeInfantil from '~/componentes-sgp/AlertaModalidadeInfantil/alertaModalidadeInfantil';
import modalidade from '~/dtos/modalidade';

const BoletimSimples = () => {
  const [loaderSecao] = useState(false);
  const [somenteConsulta] = useState(false);

  const [filtro, setFiltro] = useState({
    anoLetivo: '',
    modalidade: '',
    semestre: '',
    dreCodigo: '',
    ueCodigo: '',
    turmaCodigo: '',
    consideraHistorico: false,
  });

  const [itensSelecionados, setItensSelecionados] = useState([]);

  const onSelecionarItems = items => {
    setItensSelecionados([...items.map(item => String(item.codigo))]);
  };

  const [selecionarAlunos, setSelecionarAlunos] = useState(false);

  const onChangeFiltro = valoresFiltro => {
    setFiltro({
      anoLetivo: valoresFiltro.anoLetivo,
      modalidade: valoresFiltro.modalidadeId,
      dreCodigo: valoresFiltro.dreId,
      ueCodigo: valoresFiltro.ueId,
      turmaCodigo: valoresFiltro.turmaId,
      semestre:
        String(valoresFiltro.modalidadeId) === String(modalidade.EJA)
          ? valoresFiltro.semestre
          : 0,
      consideraHistorico: valoresFiltro.consideraHistorico
    });
    setItensSelecionados([]);
    setSelecionarAlunos(
      valoresFiltro.turmaId && valoresFiltro.opcaoAlunoId === '1'
    );
  };

  const onClickVoltar = () => {
    history.push('/');
  };

  const [resetForm, setResetForm] = useState(false);

  const onClickCancelar = () => {
    setResetForm(shortid.generate());
  };

  const onClickBotaoPrincipal = async () => {
    const resultado = await ServicoBoletimSimples.imprimirBoletim({
      ...filtro,
      alunosCodigo: itensSelecionados,
    });
    if (resultado.erro)
      erro('N??o foi poss??vel socilitar a impress??o do Boletim');
    else
      sucesso(
        'Solicita????o de gera????o do relat??rio gerada com sucesso. Em breve voc?? receber?? uma notifica????o com o resultado.'
      );
  };

  const colunas = [
    {
      title: 'N??mero',
      dataIndex: 'numeroChamada',
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
    },
  ];

  return (
    <>
      <AlertaModalidadeInfantil
        exibir={String(filtro.modalidade) === String(modalidade.INFANTIL)}
        validarModalidadeFiltroPrincipal={false}
      />
      <Cabecalho pagina="Impress??o de Boletim" />
      <Loader loading={loaderSecao}>
        <Card mx="mx-0">
          <ButtonGroup
            somenteConsulta={somenteConsulta}
            permissoesTela={{
              podeAlterar: true,
              podeConsultar: false,
              podeExcluir: false,
              podeIncluir: filtro.turmaCodigo,
            }}
            temItemSelecionado={itensSelecionados && itensSelecionados.length}
            onClickVoltar={onClickVoltar}
            onClickCancelar={onClickCancelar}
            onClickBotaoPrincipal={onClickBotaoPrincipal}
            desabilitarBotaoPrincipal={
              String(filtro.modalidade) === String(modalidade.INFANTIL) ||
              (filtro &&
                filtro.turmaCodigo > 0 &&
                selecionarAlunos &&
                !itensSelecionados?.length)
            }
            botoesEstadoVariavel={false}
            labelBotaoPrincipal="Gerar"
            modoEdicao
          />
          <Filtro onFiltrar={onChangeFiltro} resetForm={resetForm} />
          {filtro && filtro.turmaCodigo > 0 && selecionarAlunos ? (
            <div className="col-md-12 pt-2 py-0 px-0">
              <ListaPaginada
                id="lista-alunos"
                url="v1/boletim/alunos"
                idLinha="codigo"
                colunaChave="codigo"
                colunas={colunas}
                filtro={filtro}
                paramArrayFormat="repeat"
                selecionarItems={onSelecionarItems}
                temPaginacao={false}
                multiSelecao
                filtroEhValido
              />
            </div>
          ) : null}
        </Card>
      </Loader>
    </>
  );
};

export default BoletimSimples;
