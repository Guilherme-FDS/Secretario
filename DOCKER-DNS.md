# Docker: erro de DNS (`auth.docker.io` / `server misbehaving`)

O build precisa resolver `auth.docker.io` **no seu Linux** (não só dentro do container).

## Rápido

```bash
# Teste
getent hosts auth.docker.io

# Ajuste DNS (systemd-resolved — ajuste a interface se precisar)
sudo resolvectl dns default 8.8.8.8 8.8.4.4
sudo resolvectl flush-caches
```

Ou no **Docker daemon** (`/etc/docker/daemon.json`):

```json
{ "dns": ["8.8.8.8", "8.8.4.4"] }
```

Depois: `sudo systemctl restart docker`

## Se a imagem já foi baixada antes

```bash
docker compose up
```

(sem `--build`). O `docker-compose.yml` usa `build.network: host` no build para ajudar em ambientes com DNS quebrado.

## OpenRouter

Chaves ficam em `backend/.env` (`OPENROUTER_API_KEY` e `OPENROUTER_KEY`). O serviço `backend` carrega esse arquivo via `env_file` no Compose.
