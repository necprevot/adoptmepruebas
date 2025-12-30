import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Adopción de Mascotas',
            version: '1.0.0',
            description: 'Documentación de la API para el sistema de adopción de mascotas',
            contact: {
                name: 'Soporte API',
                email: 'soporte@adoptme.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'coderCookie'
                }
            }
        }
    },
    apis: ['./src/docs/*.yaml', './src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('📚 Documentación disponible en http://localhost:8080/api-docs');
};

export default swaggerSpec;