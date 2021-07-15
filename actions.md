# Aplicação de uma esteira (pipeline) baseada no Github Actions em um produto SME.  

* Situação: 

* Contribuintes: 

* Data: julho/2021 

História Técnica: 42630

## Problema 

A utilização de duas ferramentas para a execução de uma esteira para os processos de CI e CD, dificulta a manutenção e a identificação de erros por parte dos administradores e também dos desenvolvedores. Além disso, a construção de esteiras no modelo atual não é prática e não aproxima o entendimento e acompanhamento de suas execuções por parte dos desenvolvedores. 

## Requisitos 

* Utilização de self hosted runners, para permitir acesso a recursos locais da infraestrutura. 

* Repositórios devem existir dentro de uma organização para permitir o compatilhamento de runners da organização. 

* Necessário a utilização de um token para registro de um runner e outro para remoção. Se faz necessário possuir acesso administrativo a organização para se gerar estes tokens.

## Decisão 

Após prova de conceito, concluímos que de fato a esteira criada dentro do Github Actions trouxe uma maior velocidade na sua execução e facilitou o acompanhamento dos resultados por parte dos desenvolvedores, já que compartilha a mesma plataforma utilizada como repositório de códigos. Sendo assim, concluímos que sua implementação é válida. 

## Prós 

* Linguagem de fácil compreendimento.

* CI e CD na mesma ferramenta. 

* Execução de diferentes steps de forma paralela. 

* Criação de dependências entre os steps (filas). 

* Possibilidade de executar múltiplos runners em forma de container. 

* Facilidade no acompanhamento das execuções por parte dos desenvolvedores. 

* Melhor compreensão dos estágios da esteira. 

* A criação de esteiras alternativas para execuções manuais são práticas de serem configuradas. 

* Criação de secrets por environment e secrets globais. 

* Informações mais acessíveis e fáceis de serem alteradas. 

* Sem necessidade de utilização de webhook devido repositório e esteira estarem na mesma ferramenta. 

## Contras 

* Ferramenta é nova, podendo não possuir plugin para alguma ferramenta de terceiro em específico. 

* Tokens gerados para remoção e registro dos runners expiram em 60 minutos. 

* Não há possibilidade da criação de tokens sem expiração no momento. 

* A aprovação em workflows é baseada em environment, podendo haver 6 aprovadores no máximo por environment.
