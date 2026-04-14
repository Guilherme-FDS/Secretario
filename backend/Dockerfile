# Usa Node.js 24 como base
FROM node:24

# Cria a pasta de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala dependências do projeto
RUN npm install

# Instala nodemon globalmente
RUN npm install -g nodemon

# Copia todo o código do backend para dentro do container
COPY . .

# Expõe a porta do backend
EXPOSE 3000

# Comando para rodar o backend
CMD ["nodemon", "server.js"]