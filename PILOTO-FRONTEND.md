# Atualização do piloto

Aplicar junto com o backend `codex/pilot-hardening`. Não publicar apenas um lado.

## Comportamento

- Botões de venda, reposição, cadastro, edição e exclusão bloqueiam cliques enquanto enviam.
- Venda/reposição usam uma chave única confirmada no banco. Se a resposta se perder, a operação permanece no armazenamento local desse navegador, separada por e-mail. Reabrir o navegador e entrar no mesmo usuário permite confirmar a operação original.
- O aviso “Confirmar operação pendente” reenvia os mesmos dados/chave. Não inventa uma segunda venda. Não limpar os dados do navegador enquanto houver operação pendente; se trocar de equipamento, conferir o histórico antes de lançar outra.
- Sessão vencida/revogada leva ao login. Falhas de consulta aparecem como erro, não como estoque vazio ou caixa zerado.
- Em Configurações, o ADMIN pode bloquear/liberar funcionárias, encerrar sessões e trocar senhas. Senha do ADMIN continua gerenciada pela configuração do servidor.
- Validade é preservada na edição, com campo de data para alterá-la.
- Gráfico simulado e opção de recibo sem implementação removidos.
- “Lucro bruto das vendas” e “Estoque a preço de venda” descrevem os cálculos disponíveis.
- Cache PWA atualizado; não há vendas offline. Fechar todas as abas antigas após publicar e entrar novamente.

## Testes

`npm run test`, `npm run build` e `npm run lint`.
Os testes de transporte cobrem resposta perdida, chave repetida, sessão vencida, erro de consulta, validação e importação.
A aparência e instalação precisam ser conferidas no navegador/PWA da loja após a publicação.
