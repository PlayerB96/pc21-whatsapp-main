# Usa Node.js 20.16.0 como base
FROM node:20.16.0

# Instala librerías necesarias para Chromium/Puppeteer
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm-dev \
  libasound2 \
  libpangocairo-1.0-0 \
  libatspi2.0-0 \
  libgtk-3-0 \
  libpango-1.0-0 \
  libcups2 \
  libxshmfence1 \
  fonts-liberation \
  libappindicator3-1 \
  xdg-utils \
  ca-certificates \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Define la carpeta de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Asegura que Puppeteer descargue Chromium compatible (si lo usas directamente)
# Si ya lo tienes en tu package.json, no hace falta esta línea
RUN npm install puppeteer@latest

# Copia el resto del código del proyecto
COPY . .

# Expone el puerto
EXPOSE 3001

# Define variable de entorno
ENV PORT=3001

# Comando de inicio
CMD ["npm", "start"]
