# Torre de Controle de Coletas

Painel web para visualização rápida do plano diário de coletas, a partir do arquivo exportado do OTM (Oracle Transportation Management). 100% client-side: roda inteiramente no navegador, sem backend e sem envio de dados para nenhum servidor — o Excel carregado nunca sai da sua máquina.

**Status:** V1.1 — ferramenta de consulta/visualização para uso interno do time Inbound. Não substitui, por enquanto, o acompanhamento feito pelo planejamento.

## O que o painel faz

- Carrega o Excel exportado do OTM (`.xlsx` / `.xls`) direto no navegador
- Mostra KPIs: total de coletas, valor total de frete, nº de transportadoras
- Tabela filtrável por: Shipment ID (busca), status operacional, transportadora, origem, destino e intervalo de datas
- Seletor de colunas visíveis, com preferência salva no navegador (`localStorage`)
- Conversão automática de datas/horas do formato serial do Excel

## Como usar

1. Abra o link do painel (ou o `index.html`, se estiver rodando localmente)
2. Clique em **Selecionar Arquivo** e carregue o export do OTM do dia
3. Use os filtros da barra de ferramentas para refinar a visualização
4. Use **Selecionar Colunas** para customizar quais campos aparecem na tabela

## Formato esperado do arquivo

O Excel exportado do OTM precisa conter, no mínimo, estas colunas:

- `Shipment ID`
- `Service Provider ID`
- `Start Time`
- `End Time`
- `Status_1`

Se alguma faltar, o painel avisa quais colunas estão ausentes e não carrega os dados.

O mapeamento `Service Provider ID → Nome da Transportadora` e as colunas padrão/ignoradas ficam em `config.js` (`APP_CONFIG`). Se o cadastro de transportadoras mudar, é só atualizar esse arquivo.

## Estrutura do projeto

```
index.html      → estrutura da página
style.css       → estilização
config.js       → configuração (colunas padrão, colunas ignoradas, mapa de transportadoras)
app.js          → lógica da aplicação (leitura do Excel, filtros, KPIs, tabela)
xlsx.full.min.js → biblioteca SheetJS (leitura do Excel no navegador)
```

## Limitações conhecidas (V1.1)

- Ferramenta de **visualização**, não de **registro de status**: não há campo de status/observação editável pelo usuário nem persistência entre sessões além da seleção de colunas
- Sem controle de acesso — qualquer pessoa com o link acessa a interface (os dados só entram quando alguém carrega o próprio Excel)
- Mapeamento de transportadoras é fixo em `config.js`, exige manutenção manual
- Hospedagem atual (GitHub Pages, conta pessoal) é um piloto temporário — não é o canal oficial de TI da empresa

## Roadmap

- **V2**: adicionar campos de status/observação preenchíveis, para que o planejamento acompanhe o andamento das coletas diretamente pelo painel, reduzindo a dependência de follow-up manual com as transportadoras
- Avaliar migração para hospedagem corporativa oficial (substituindo o GitHub Pages pessoal)

## Aviso

Este é um projeto interno, desenvolvido fora dos canais oficiais de TI como piloto. Dados tratados são os mesmos já exportados do OTM pelo usuário — nada é enviado a terceiros, mas o uso do link deve ficar restrito aos usuários-chave combinados até que uma hospedagem oficial seja definida.
