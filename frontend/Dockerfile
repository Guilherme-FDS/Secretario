# Node base
FROM node:24

# Diretório de trabalho
WORKDIR /app

# Copia dependências primeiro (melhor cache)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o projeto
COPY . .

# Corrige permissões do Vite e binários
RUN chmod -R 755 /app/node_modules/.bin

# Porta do Vite
EXPOSE 5173

# IMPORTANTE: host 0.0.0.0 para funcionar no Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]