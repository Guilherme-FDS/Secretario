# IA via OpenRouter (Secretário)

## Configuração

1. Copie `.env.example` para `.env` (ou edite o `.env` existente).
2. Defina `OPENROUTER_API_KEY` com uma chave de [openrouter.ai/keys](https://openrouter.ai/keys).
3. Opcional: `LLM_MODEL` (ex.: `openai/gpt-4.1-mini`, `openai/gpt-4o-mini`), `LLM_BASE_URL` (padrão `https://openrouter.ai/api/v1`), `LLM_APP_NAME` e `LLM_SITE_URL` (headers recomendados pela OpenRouter).

## Docker

Na raiz do projeto, exporte a chave ou use um ficheiro `.env` ao lado do `docker-compose.yml`:

```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
docker compose up --build
```

O `docker-compose` injeta `OPENROUTER_API_KEY`, `LLM_*` e mantém compatibilidade com `OPENROUTER_KEY`.

## Comportamento

- **Importação CSV**: gera `descricao_ia` via modelo; se a IA falhar ou não houver chave, usa uma frase montada só com dados reais.
- **POST /chat**: responde com `resposta`, `fonte` (`ia` ou `fallback`) e, se aplicável, `codigo` (ex.: `NO_API_KEY`, `QUOTA`, `RATE_LIMIT`). Erros de IA não derrubam o processo Node.

## Testar

```bash
curl -s -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d '{"pergunta":"Resuma os pagamentos por obra"}'
```
