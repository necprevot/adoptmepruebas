# 🐾 AdoptMe - Sistema de Adopción de Mascotas

API RESTful para la gestión de adopciones de mascotas, desarrollada con Node.js, Express y MongoDB.

[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-necprevot%2Fadoptme-blue?logo=docker)](https://hub.docker.com/repository/docker/necprevot/adoptme/general)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-80%2B%20passing-brightgreen)]()

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Local](#-instalación-local)
- [Docker](#-docker)
- [Kubernetes](#️-kubernetes)
- [Documentación API](#-documentación-api)
- [Testing](#-testing)
- [Variables de Entorno](#-variables-de-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Seguridad](#-seguridad)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

- 👥 **Gestión completa de usuarios** (CRUD) con autenticación JWT
- 🐶 **Gestión de mascotas** (CRUD) con soporte para imágenes
- 🤝 **Sistema de adopciones** con validaciones de integridad
- 📄 **Subida de documentos** por usuario (PDF, DOC, DOCX, TXT) - máximo 5 archivos
- 🔐 **Autenticación segura** con JWT y cookies HTTP-only
- 📝 **Documentación completa** con Swagger UI
- 🧪 **Tests funcionales** con Mocha, Chai y Supertest (80+ tests)
- 🐳 **Dockerizado** y listo para producción
- ☸️ **Kubernetes ready** con manifiestos incluidos
- 📊 **Generación de datos mock** para pruebas con Faker.js
- 🕐 **Tracking de last_connection** en login/logout
- 📈 **Auto-escalado** configurado con HPA en Kubernetes

## 🛠 Tecnologías

- **Backend:** Node.js 18+ + Express 4.x
- **Base de Datos:** MongoDB 6+ (Atlas) + Mongoose 6.x
- **Autenticación:** JWT + Bcrypt (10 salt rounds)
- **Documentación:** Swagger UI + OpenAPI 3.0
- **Testing:** Mocha + Chai + Supertest
- **Upload de archivos:** Multer (con filtros y límites)
- **Contenedorización:** Docker 20+
- **Orquestación:** Kubernetes + Minikube
- **Mock Data:** Faker.js 10+

## 📦 Requisitos Previos

### Para ejecución local:
- Node.js 18 o superior
- MongoDB (local o Atlas)
- npm 8+ o yarn

### Para ejecución con Docker:
- Docker Desktop 20+
- Docker Compose 2+ (opcional)

### Para Kubernetes:
- kubectl instalado
- Minikube (desarrollo local)
- O acceso a cluster de Kubernetes (GKE, EKS, AKS)

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

Crea un archivo `.env` en la raíz del proyecto:
```env
# MongoDB
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/adoptme

# Server
PORT=8080

# JWT
JWT_SECRET=tokenSecretJWT

# Cookies
COOKIE_NAME=coderCookie
COOKIE_MAX_AGE=3600000
```

### 4. Crear carpetas necesarias
```bash
mkdir -p public/img public/pets public/documents
```

### 5. Ejecutar la aplicación
```bash
# Modo desarrollo (con nodemon - recarga automática)
npm run dev

# Modo producción
npm start
```

La aplicación estará disponible en `http://localhost:8080`

## 🐳 Docker

### Imagen en Docker Hub

**🔗 Link de la imagen:** [https://hub.docker.com/repository/docker/necprevot/adoptme](https://hub.docker.com/repository/docker/necprevot/adoptme/general)

### Descargar y ejecutar desde Docker Hub
```bash
# Descargar la imagen
docker pull necprevot/adoptme:latest

# Ejecutar el contenedor
docker run -d \
  --name adoptme-app \
  -p 8080:8080 \
  -e MONGO_URL="mongodb+srv://user:password@cluster.mongodb.net/adoptme" \
  -e JWT_SECRET="tokenSecretJWT" \
  -e PORT="8080" \
  necprevot/adoptme:latest

# Ver logs en tiempo real
docker logs -f adoptme-app

# Detener el contenedor
docker stop adoptme-app

# Eliminar el contenedor
docker rm adoptme-app
```

### Construcción local de la imagen
```bash
# Construir la imagen localmente
docker build -t necprevot/adoptme:latest .

# Ejecutar localmente
docker run -d \
  --name adoptme-app \
  -p 8080:8080 \
  -e MONGO_URL="tu_mongodb_url" \
  -e JWT_SECRET="tu_secret" \
  necprevot/adoptme:latest

# Subir a Docker Hub (requiere login)
docker login
docker push necprevot/adoptme:latest
```

### Docker Compose (Recomendado para desarrollo)

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
    networks:
      - adoptme-network

  app:
    image: necprevot/adoptme:latest
    container_name: adoptme-app
    ports:
      - "8080:8080"
    environment:
      - MONGO_URL=mongodb://admin:admin123@mongodb:27017/adoptme?authSource=admin
      - PORT=8080
      - JWT_SECRET=tokenSecretJWT
      - COOKIE_NAME=coderCookie
      - COOKIE_MAX_AGE=3600000
    depends_on:
      - mongodb
    restart: unless-stopped
    networks:
      - adoptme-network

volumes:
  mongodb_data:

networks:
  adoptme-network:
    driver: bridge
```

Ejecutar:
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (elimina datos)
docker-compose down -v
```

### Verificación de Docker
```bash
# Ver contenedores en ejecución
docker ps

# Acceder al contenedor
docker exec -it adoptme-app sh

# Ver uso de recursos
docker stats adoptme-app

# Probar la API
curl http://localhost:8080/api/users
```

## ☸️ Kubernetes

### Despliegue en Kubernetes

Para desplegar en Kubernetes (local con Minikube o en producción):

#### Requisitos previos
- kubectl instalado y configurado
- Minikube (para desarrollo local) o acceso a un cluster

#### Estructura de archivos
```
k8s/
├── deployment.yaml     # Deployment con 3 réplicas
├── service.yaml        # Servicio tipo LoadBalancer/NodePort
├── secrets.yaml        # Secrets para MongoDB y JWT
└── hpa.yaml           # Auto-escalado horizontal (2-10 réplicas)
```

#### Despliegue paso a paso

**1. Configurar secretos**

Edita `k8s/secrets.yaml` con tus credenciales:
```bash
kubectl apply -f k8s/secrets.yaml
```

**2. Aplicar el deployment y servicio**
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

**3. Verificar el despliegue**
```bash
# Ver pods
kubectl get pods

# Ver servicios
kubectl get services

# Ver todos los recursos
kubectl get all

# Ver logs
kubectl logs -f deployment/adoptme-deployment
```

#### Acceso local con Minikube
```bash
# 1. Iniciar Minikube
minikube start

# 2. (Opcional) Configurar Docker para Minikube
eval $(minikube docker-env)

# 3. (Opcional) Construir imagen en Minikube
docker build -t necprevot/adoptme:latest .

# 4. Aplicar manifiestos
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# 5. Obtener URL del servicio
minikube service adoptme-service --url
```

**⚠️ IMPORTANTE:** El comando `minikube service adoptme-service --url` mostrará algo como:
```
http://127.0.0.1:55318
❗ Because you are using a Docker driver on darwin, the terminal needs to be open to run it.
```

**Debes mantener esa terminal abierta** mientras uses el servicio.

En otra terminal, accede a:
- **API Docs:** http://127.0.0.1:PUERTO/api-docs
- **Users:** http://127.0.0.1:PUERTO/api/users
- **Pets:** http://127.0.0.1:PUERTO/api/pets

#### Comandos útiles de Kubernetes
```bash
# Ver estado de todos los recursos
kubectl get all

# Ver logs en tiempo real
kubectl logs -f deployment/adoptme-deployment

# Ver logs de un pod específico
kubectl logs <pod-name>

# Escalar manualmente
kubectl scale deployment adoptme-deployment --replicas=5

# Ver métricas de CPU/Memoria
kubectl top pods

# Ver descripción del deployment
kubectl describe deployment adoptme-deployment

# Ver eventos del cluster
kubectl get events --sort-by='.lastTimestamp'

# Eliminar todos los recursos
kubectl delete -f k8s/

# Reiniciar deployment
kubectl rollout restart deployment/adoptme-deployment

# Ver historial de despliegues
kubectl rollout history deployment/adoptme-deployment
```

#### Auto-escalado (HPA)

El HPA (Horizontal Pod Autoscaler) escala automáticamente basado en CPU:
- **Mínimo:** 2 réplicas
- **Máximo:** 10 réplicas
- **Umbral:** 70% CPU
```bash
# Ver estado del auto-escalado
kubectl get hpa

# Descripción detallada
kubectl describe hpa adoptme-hpa

# Ver en tiempo real
kubectl get hpa -w
```

#### Troubleshooting Kubernetes

**Si los pods no inician:**
```bash
# Ver eventos
kubectl get events --sort-by='.lastTimestamp'

# Describir pod específico
kubectl get pods
kubectl describe pod <pod-name>

# Ver logs del pod (incluso si está crasheando)
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # logs del contenedor anterior
```

**Si el servicio no es accesible en Minikube:**
```bash
# Opción 1: Usar minikube tunnel (en terminal separada)
minikube tunnel

# Opción 2: Cambiar a NodePort
kubectl edit service adoptme-service
# Cambiar type: LoadBalancer a type: NodePort

# Obtener URL con NodePort
minikube service adoptme-service --url

# Opción 3: Port-forward
kubectl port-forward service/adoptme-service 8080:80
# Luego accede a http://localhost:8080
```

**Si hay problemas con la imagen:**
```bash
# Ver si la imagen está siendo descargada
kubectl describe pod <pod-name> | grep -i image

# Si hay ImagePullBackOff, construir en Minikube
eval $(minikube docker-env)
docker build -t necprevot/adoptme:latest .

# Editar deployment para no descargar de Docker Hub
kubectl edit deployment adoptme-deployment
# Cambiar imagePullPolicy: Always a imagePullPolicy: IfNotPresent
```

#### Despliegue en producción con Kubernetes

Para producción, ajusta los recursos en `k8s/deployment.yaml`:
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

**Servicios de Kubernetes recomendados:**
- **Google Cloud:** GKE (Google Kubernetes Engine)
- **AWS:** EKS (Elastic Kubernetes Service)
- **Azure:** AKS (Azure Kubernetes Service)
- **DigitalOcean:** DOKS (DigitalOcean Kubernetes)

**Ejemplo de despliegue en GKE:**
```bash
# Crear cluster
gcloud container clusters create adoptme-cluster \
  --num-nodes=3 \
  --machine-type=e2-medium

# Obtener credenciales
gcloud container clusters get-credentials adoptme-cluster

# Aplicar manifiestos
kubectl apply -f k8s/

# Obtener IP externa
kubectl get service adoptme-service
```

## 📚 Documentación API

La documentación interactiva de Swagger está disponible en:
```
http://localhost:8080/api-docs
```

### Módulos Documentados

✅ **Users** - Gestión de usuarios y documentos  
✅ **Pets** - Gestión de mascotas con imágenes  
✅ **Adoptions** - Proceso de adopción  
✅ **Sessions** - Autenticación y registro  
✅ **Mocks** - Generación de datos de prueba

### Endpoints Principales

#### 👥 Users
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:uid` - Obtener usuario por ID
- `PUT /api/users/:uid` - Actualizar usuario
- `DELETE /api/users/:uid` - Eliminar usuario
- `POST /api/users/:uid/documents` - Subir documentos (máx 5 archivos: PDF, DOC, DOCX, TXT)

#### 🐶 Pets
- `GET /api/pets` - Obtener todas las mascotas
- `POST /api/pets` - Crear mascota
- `POST /api/pets/withimage` - Crear mascota con imagen (JPG, PNG, GIF - máx 5MB)
- `PUT /api/pets/:pid` - Actualizar mascota
- `DELETE /api/pets/:pid` - Eliminar mascota

#### 🤝 Adoptions
- `GET /api/adoptions` - Obtener todas las adopciones
- `GET /api/adoptions/:aid` - Obtener adopción por ID
- `POST /api/adoptions/:uid/:pid` - Crear adopción (valida que mascota no esté adoptada)

#### 🔐 Sessions
- `POST /api/sessions/register` - Registrar usuario (crea documents=[], last_connection)
- `POST /api/sessions/login` - Iniciar sesión (actualiza last_connection, retorna cookie)
- `POST /api/sessions/logout` - Cerrar sesión (actualiza last_connection)
- `GET /api/sessions/current` - Usuario actual (requiere cookie de autenticación)

#### 📊 Mocks (Datos de prueba)
- `GET /api/mocks/mockingpets` - Generar 100 mascotas mock
- `GET /api/mocks/mockingusers` - Generar 50 usuarios mock
- `POST /api/mocks/generateData` - Insertar datos en BD

**Body para generateData:**
```json
{
  "users": 10,
  "pets": 20
}
```

### Ejemplos de uso con cURL
```bash
# Registrar usuario
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' \
  -c cookies.txt

# Crear mascota
curl -X POST http://localhost:8080/api/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "specie": "dog",
    "birthDate": "2020-01-15"
  }'

# Subir documentos
curl -X POST http://localhost:8080/api/users/USER_ID/documents \
  -F "documents=@documento1.pdf" \
  -F "documents=@documento2.pdf"

# Crear adopción
curl -X POST http://localhost:8080/api/adoptions/USER_ID/PET_ID
```

## 🧪 Testing

### Ejecutar todos los tests
```bash
# Antes de ejecutar tests, asegúrate de que el servidor esté corriendo
# Terminal 1:
npm run dev

# Terminal 2:
npm test
```

### Tests por módulo
```bash
npm run test:users      # Tests de usuarios (25+ tests)
npm run test:pets       # Tests de mascotas (30+ tests)
npm run test:sessions   # Tests de autenticación (25+ tests)
npm run test:adoption   # Tests de adopciones (15+ tests)
npm run test:setup      # Tests de configuración (5+ tests)
npm run test:watch      # Modo watch (re-ejecuta al guardar)
```

### Cobertura de tests (80+ tests en total)

#### ✅ Users Router (25 tests)
- Registro de usuarios (validaciones, duplicados, campos requeridos)
- Obtener todos los usuarios y por ID
- Actualización de usuarios (campos individuales y múltiples)
- Eliminación de usuarios
- Validaciones de integridad (email minúsculas, password hasheado, rol por defecto)

#### ✅ Pets Router (30+ tests)
- Creación de mascotas (validaciones, especies válidas)
- Obtener todas las mascotas
- Actualización de mascotas (nombre, especie, estado adoptado)
- Eliminación de mascotas
- Validaciones de fechas y formatos
- Tests de rendimiento

#### ✅ Sessions Router (25 tests)
- Registro (validaciones completas, documents vacío, last_connection)
- Login (cookie, JWT válido, last_connection actualizado)
- Logout (last_connection actualizado, cookie limpiada)
- Current user (autenticación con token)
- Flujo completo de autenticación

#### ✅ Adoptions Router (15+ tests)
- Obtener todas las adopciones
- Obtener adopción específica por ID
- Crear adopción (validaciones de usuario, mascota, estado)
- Validaciones de integridad (array pets actualizado, adopted=true)

#### ✅ Setup tests (5+ tests)
- Disponibilidad del servidor
- Formato de respuestas API
- Conexión a base de datos

**Nota:** El servidor debe estar corriendo en `http://localhost:8080` antes de ejecutar los tests.

### Ejemplo de salida de tests
```
Testing Users Module
  POST /api/sessions/register
    ✓ Debe registrar un nuevo usuario correctamente
    ✓ Debe crear el usuario con el rol "user" por defecto
    ✓ Debe crear el usuario con un array de documents vacío
    ...
  GET /api/users
    ✓ Debe obtener todos los usuarios
    ✓ Los usuarios deben tener la estructura correcta
    ...

Testing Pets Module
  POST /api/pets
    ✓ Debe crear una nueva mascota correctamente
    ...

Testing Sessions Module
  POST /api/sessions/login
    ✓ Debe actualizar last_connection al hacer login
    ...

Testing Adoptions Module
  POST /api/adoptions/:uid/:pid
    ✓ Debe crear una adopción exitosamente
    ...

  80 passing (12s)
```

## 🔧 Variables de Entorno

| Variable | Descripción | Valor por defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `MONGO_URL` | URL de conexión a MongoDB Atlas o local | - | ✅ Sí |
| `PORT` | Puerto del servidor | 8080 | ❌ No |
| `JWT_SECRET` | Secret para tokens JWT | tokenSecretJWT | ⚠️ Cambiar en prod |
| `COOKIE_NAME` | Nombre de la cookie de sesión | coderCookie | ❌ No |
| `COOKIE_MAX_AGE` | Duración de la cookie en ms | 3600000 (1h) | ❌ No |

### Ejemplo de archivo .env
```env
# MongoDB Atlas
MONGO_URL=mongodb+srv://user:password@cluster0.mongodb.net/adoptme?retryWrites=true&w=majority

# Servidor
PORT=8080

# JWT (⚠️ Cambiar en producción)
JWT_SECRET=mi_secret_super_seguro_random_123456

# Cookies
COOKIE_NAME=coderCookie
COOKIE_MAX_AGE=3600000
```

## 📁 Estructura del Proyecto
```
adoptme/
├── src/
│   ├── config/
│   │   └── swagger.js           # Configuración de Swagger UI
│   ├── controllers/
│   │   ├── adoptions.controller.js
│   │   ├── pets.controller.js
│   │   ├── sessions.controller.js
│   │   └── users.controller.js
│   ├── dao/
│   │   ├── models/
│   │   │   ├── Adoption.js      # Modelo de adopción
│   │   │   ├── Pet.js           # Modelo de mascota
│   │   │   └── User.js          # Modelo de usuario (con documents y last_connection)
│   │   ├── Adoption.js          # DAO de adopciones
│   │   ├── Pets.dao.js          # DAO de mascotas
│   │   └── Users.dao.js         # DAO de usuarios
│   ├── dto/
│   │   ├── Pet.dto.js           # DTO de mascotas
│   │   └── User.dto.js          # DTO de usuarios (para JWT)
│   ├── docs/                    # Documentación Swagger (YAML)
│   │   ├── adoptions.yaml
│   │   ├── pets.yaml
│   │   ├── sessions.yaml
│   │   └── users.yaml
│   ├── repository/
│   │   ├── GenericRepository.js
│   │   ├── AdoptionRepository.js
│   │   ├── PetRepository.js
│   │   └── UserRepository.js
│   ├── routes/
│   │   ├── adoption.router.js
│   │   ├── mocks.router.js
│   │   ├── pets.router.js
│   │   ├── sessions.router.js
│   │   └── users.router.js
│   ├── services/
│   │   └── index.js             # Instancias de servicios
│   ├── utils/
│   │   ├── index.js             # Utilidades (hash, validación)
│   │   ├── mocking.js           # Generación de datos mock con Faker
│   │   └── uploader.js          # Configuración de Multer (3 uploaders)
│   └── app.js                   # Punto de entrada, configuración Express
├── test/
│   ├── adoption.test.js         # 15+ tests
│   ├── pets.test.js             # 30+ tests
│   ├── sessions.test.js         # 25+ tests
│   ├── setup.test.js            # 5+ tests
│   └── users.test.js            # 25+ tests
├── k8s/                         # Manifiestos de Kubernetes
│   ├── deployment.yaml          # 3 réplicas, health checks
│   ├── service.yaml             # LoadBalancer
│   ├── secrets.yaml             # MongoDB URL, JWT Secret
│   └── hpa.yaml                 # Auto-escalado 2-10 réplicas
├── public/                      # Archivos subidos
│   ├── img/                     # Imágenes genéricas (legacy)
│   ├── pets/                    # Imágenes de mascotas (max 5MB)
│   └── documents/               # Documentos de usuarios (max 10MB)
├── .dockerignore                # Archivos ignorados por Docker
├── .env                         # Variables de entorno (NO subir a Git)
├── .gitignore                   # Archivos ignorados por Git
├── .mocharc.json                # Configuración de Mocha
├── docker-compose.yml           # Docker Compose (app + MongoDB)
├── Dockerfile                   # Imagen de Docker (Node 22.20.0)
├── package.json                 # Dependencias y scripts
└── README.md                    # Este archivo
```

## 🔒 Seguridad

### Medidas implementadas

- ✅ **Contraseñas hasheadas** con bcrypt (10 salt rounds)
- ✅ **JWT con expiración** de 1 hora
- ✅ **Cookies HTTP-only** (no accesibles desde JavaScript)
- ✅ **Variables de entorno** para credenciales sensibles
- ✅ **Validación de tipos de archivo** en uploads
  - Imágenes: JPG, PNG, GIF
  - Documentos: PDF, DOC, DOCX, TXT
- ✅ **Límites de tamaño** en uploads
  - Imágenes: 5MB máximo
  - Documentos: 10MB máximo
- ✅ **Máximo 5 documentos** por usuario en una petición
- ✅ **Validación de IDs** de MongoDB
- ✅ **CORS configurado** (si es necesario)

### Recomendaciones para producción

⚠️ **Cambiar JWT_SECRET** a un valor aleatorio y seguro  
⚠️ **Usar HTTPS** con certificados SSL/TLS  
⚠️ **Configurar rate limiting** para prevenir ataques  
⚠️ **Implementar logs** con Winston o similar  
⚠️ **Monitoreo** con Prometheus, Grafana o New Relic  
⚠️ **Backups** regulares de MongoDB  
⚠️ **Variables de entorno** en Kubernetes Secrets  

## 🚀 Despliegue en Producción

### Recomendaciones

1. **Base de datos:** Usa MongoDB Atlas para producción
2. **Variables de entorno:** Nunca incluyas credenciales en el código
3. **HTTPS:** Usa un reverse proxy (Nginx) con certificados SSL
4. **Logs:** Implementa un sistema de logging (Winston, Morgan)
5. **Monitoreo:** Usa herramientas como PM2, New Relic o Datadog
6. **Escalado:** Considera Kubernetes para auto-escalado
7. **CI/CD:** Implementa pipelines con GitHub Actions o GitLab CI

### Ejemplo de despliegue con Docker
```bash
# Descargar imagen desde Docker Hub
docker pull necprevot/adoptme:latest

# Ejecutar en producción
docker run -d \
  --name adoptme-prod \
  -p 80:8080 \
  --restart=always \
  -e MONGO_URL="mongodb+srv://..." \
  -e JWT_SECRET="secret_muy_seguro_aleatorio_123456" \
  -e NODE_ENV="production" \
  necprevot/adoptme:latest

# Ver logs
docker logs -f adoptme-prod
```

### Ejemplo de despliegue en Kubernetes (producción)
```bash
# 1. Crear namespace
kubectl create namespace adoptme-prod

# 2. Crear secrets
kubectl create secret generic adoptme-secrets \
  --from-literal=mongo-url="mongodb+srv://..." \
  --from-literal=jwt-secret="secret_seguro" \
  -n adoptme-prod

# 3. Aplicar manifiestos
kubectl apply -f k8s/ -n adoptme-prod

# 4. Verificar
kubectl get all -n adoptme-prod

# 5. Configurar ingress (opcional)
kubectl apply -f k8s/ingress.yaml -n adoptme-prod
```

### Plataformas recomendadas

- **Kubernetes:** GKE, EKS, AKS, DOKS
- **PaaS:** Heroku, Railway, Render, DigitalOcean App Platform
- **Serverless:** Google Cloud Run, AWS Fargate
- **VPS:** DigitalOcean Droplets, Linode, AWS EC2

## 🤝 Contribuir

¿Quieres contribuir al proyecto? ¡Genial! Sigue estos pasos:

1. **Fork el proyecto**
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit tus cambios** (`git commit -m 'Add some AmazingFeature'`)
4. **Push a la rama** (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Guías de contribución

- Escribe tests para nuevas funcionalidades
- Sigue el estilo de código existente
- Actualiza la documentación si es necesario
- Asegúrate de que todos los tests pasen: `npm test`

## 📝 Scripts Disponibles
```bash
npm start             # Iniciar en producción
npm run dev           # Iniciar en desarrollo (nodemon)
npm test              # Ejecutar todos los tests (80+)
npm run test:users    # Tests de usuarios (25)
npm run test:pets     # Tests de mascotas (30+)
npm run test:sessions # Tests de sesiones (25)
npm run test:adoption # Tests de adopciones (15+)
npm run test:setup    # Tests de configuración (5+)
npm run test:watch    # Modo watch para tests

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👨‍💻 Autor

Desarrollado por **Nelson Candia** como proyecto final del curso de Backend

- Docker Hub: [necprevot/adoptme](https://hub.docker.com/repository/docker/necprevot/adoptme/general)
- GitHub: [Enlace al repositorio] (https://github.com/necprevot/adoptmepruebas)

---

## 📞 Soporte y Contacto

¿Tienes preguntas o encontraste un bug? 

- 🐛 **Issues:** Abre un issue en el repositorio de GitHub
- 📧 **Email:** [pruebas@example.com]
- 💬 **Documentación:** http://localhost:8080/api-docs
- 🐳 **Docker Hub:** https://hub.docker.com/repository/docker/necprevot/adoptme

---

## 🎯 Características técnicas destacadas

- ✨ **Arquitectura limpia** con patrón Repository y DTO
- 🔄 **Separación de responsabilidades** (DAO, Repository, Service, Controller)
- 📦 **Modularización** completa del código
- 🧪 **80+ tests** con alta cobertura
- 📝 **Documentación automática** con Swagger
- 🐳 **Containerización** con Docker y Docker Compose
- ☸️ **Orquestación** con Kubernetes y auto-escalado
- 🔐 **Seguridad** con JWT, bcrypt y validaciones
- 📊 **Mock data** para desarrollo y testing
- 🕐 **Auditoría** con last_connection y timestamps

---

**⭐ Si este proyecto te fue útil, no olvides darle una estrella en GitHub!**

**🐳 Pull de Docker Hub:**
```bash
docker pull necprevot/adoptme:latest
```

**☸️ Deploy en Kubernetes:**
```bash
kubectl apply -f k8s/
```

---

*Última actualización: Diciembre 2025*