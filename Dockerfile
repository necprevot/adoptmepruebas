FROM node:22.20.0

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install --production

# Copia el resto de los archivos del proyecto
COPY ./src ./src

# Crea el directorio para las imágenes subidas
# RUN mkdir -p /app/src/public/img

# Expone el puerto en el que corre la aplicación
EXPOSE 8080

# Define variables de entorno por defecto
# ENV PORT=8080
# ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["npm", "start"]