# 🐾 AdoptMe - Sistema de Adopción de Mascotas

API RESTful para la gestión de adopciones de mascotas, desarrollada con Node.js, Express y MongoDB.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación Local](#instalación-local)
- [Docker](#docker)
- [Documentación API](#documentación-api)
- [Testing](#testing)
- [Estructura del Proyecto](#estructura-del-proyecto)

## ✨ Características

- 👥 Gestión completa de usuarios (CRUD)
- 🐶 Gestión de mascotas (CRUD)
- 🤝 Sistema de adopciones
- 🔐 Autenticación con JWT
- 📝 Documentación con Swagger
- 🧪 Tests funcionales completos
- 🐳 Dockerizado y listo para producción
- 📊 Generación de datos mock para pruebas

## 🛠 Tecnologías

- **Backend:** Node.js + Express
- **Base de Datos:** MongoDB + Mongoose
- **Autenticación:** JWT + Bcrypt
- **Documentación:** Swagger
- **Testing:** Mocha + Chai + Supertest
- **Contenedorización:** Docker

## 📦 Requisitos Previos

- Node.js 18+ (si se ejecuta localmente)
- MongoDB (si se ejecuta localmente)
- Docker y Docker Compose (para ejecución con contenedores)

## 🚀 Instalación Local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd adoptme
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Edita el archivo `src/app.js` y actualiza la URL de MongoDB:

```javascript
const connection = mongoose.connect(`TU_URL_DE_MONGO`)
```

### 4. Ejecutar la aplicación

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

La aplicación estará disponible en `http://localhost:8080`

## 🐳 Docker

### Imagen en Docker Hub

**Link de la imagen:** `https://hub.docker.com/r/TU_USUARIO/adoptme`

Para descargar la imagen:

```bash
docker pull TU_USUARIO/adoptme:latest
```

### Construcción de la imagen

```bash
# Construir la imagen
docker build -t adoptme:latest .

# Etiquetar para Docker Hub
docker tag adoptme:latest TU_USUARIO/adoptme:latest

# Subir a Docker Hub
docker push TU_USUARIO/adoptme:latest
```

### Ejecutar con Docker

#### Opción 1: Docker Run

```bash
docker run -d \
  --name adoptme-app \
  -p 8080:8080 \
  -e MONGO_URL="tu_url_de_mongodb" \
  TU_USUARIO/adoptme:latest
```

#### Opción 2: Docker Compose

Crea un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: adoptme-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123

  app:
    image: TU_USUARIO/adoptme:latest
    container_name: adoptme-app
    ports:
      - "8080:8080"
    environment:
      - MONGO_URL=mongodb://admin:admin123@mongodb:27017/adoptme?authSource=admin
      - PORT=8080
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

Ejecutar:

```bash
docker-compose up -d
```

### Verificar que el contenedor está corriendo

```bash
docker ps
docker logs adoptme-app
```

## 📚 Documentación API

La documentación interactiva de Swagger está disponible en:

```
http://localhost:8080/api-docs
```

### Endpoints Principales

#### Users
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:uid` - Obtener usuario por ID
- `PUT /api/users/:uid` - Actualizar usuario
- `DELETE /api/users/:uid` - Eliminar usuario

#### Pets
- `GET /api/pets` - Obtener todas las mascotas
- `POST /api/pets` - Crear mascota
- `PUT /api/pets/:pid` - Actualizar mascota
- `DELETE /api/pets/:pid` - Eliminar mascota

#### Adoptions
- `GET /api/adoptions` - Obtener todas las adopciones
- `GET /api/adoptions/:aid` - Obtener adopción por ID
- `POST /api/adoptions/:uid/:pid` - Crear adopción

#### Sessions
- `POST /api/sessions/register` - Registrar usuario
- `POST /api/sessions/login` - Iniciar sesión
- `GET /api/sessions/current` - Usuario actual

#### Mocks (Datos de prueba)
- `GET /api/mocks/mockingpets` - Generar 100 mascotas mock
- `GET /api/mocks/mockingusers` - Generar 50 usuarios mock
- `POST /api/mocks/generateData` - Insertar datos en BD

## 🧪 Testing

### Ejecutar todos los tests

```bash
npm test
```

### Tests implementados

- ✅ **Tests de Adopciones:** Cobertura completa de todos los endpoints de `adoption.router.js`
  - GET /api/adoptions (obtener todas)
  - GET /api/adoptions/:aid (obtener por ID)
  - POST /api/adoptions/:uid/:pid (crear adopción)
  - Validaciones de errores y casos edge

### Estructura de tests

```
test/
  ├── supertest.test.js       # Tests generales
  └── adoption.test.js         # Tests de adopciones
```

## 📁 Estructura del Proyecto

```
adoptme/
├── src/
│   ├── controllers/         # Controladores de rutas
│   ├── dao/                 # Data Access Objects
│   ├── dto/                 # Data Transfer Objects
│   ├── models/              # Modelos de Mongoose
│   ├── repository/          # Capa de repositorio
│   ├── routes/              # Definición de rutas
│   ├── services/            # Servicios de negocio
│   ├── utils/               # Utilidades
│   ├── docs/                # Documentación Swagger
│   └── app.js               # Punto de entrada
├── test/                    # Tests
├── Dockerfile               # Configuración Docker
├── .dockerignore           # Archivos ignorados por Docker
├── package.json            # Dependencias
└── README.md              # Este archivo
```

## 🔧 Configuración Adicional

### Variables de Entorno

Puedes configurar las siguientes variables:

```bash
PORT=8080                    # Puerto de la aplicación
MONGO_URL=mongodb://...      # URL de MongoDB
NODE_ENV=production          # Entorno (development/production)
JWT_SECRET=tokenSecretJWT    # Secret para JWT
```

### Seguridad

- Las contraseñas se hashean con bcrypt (10 salt rounds)
- JWT con expiración de 1 hora
- Cookies HTTP-only para tokens

## 📝 Scripts Disponibles

```bash
npm start       # Iniciar en modo producción
npm run dev     # Iniciar en modo desarrollo (con nodemon)
npm test        # Ejecutar tests
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👨‍💻 Autor

Desarrollado como proyecto final del curso de Backend

---

## 🚢 Despliegue en Producción

### Usando Docker Hub

1. **Descargar la imagen:**
```bash
docker pull TU_USUARIO/adoptme:latest
```

2. **Ejecutar:**
```bash
docker run -d -p 8080:8080 \
  -e MONGO_URL="tu_mongodb_url" \
  TU_USUARIO/adoptme:latest
```

3. **Verificar:**
```bash
curl http://localhost:8080/api/users
```

### Notas Importantes

- Asegúrate de tener MongoDB corriendo y accesible
- La aplicación expone el puerto 8080
- Los logs se pueden ver con `docker logs adoptme-app`
- Para producción, considera usar MongoDB Atlas o un servicio administrado

---

**¿Necesitas ayuda?** Abre un issue en el repositorio.