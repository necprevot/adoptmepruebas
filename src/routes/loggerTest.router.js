import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

router.get('/loggerTest', (req, res) => {
    logger.debug('Mensaje de DEBUG - Información detallada para desarrollo');
    logger.http('Mensaje de HTTP - Registro de peticiones HTTP');
    logger.info('Mensaje de INFO - Información general del sistema');
    logger.warning('Mensaje de WARNING - Advertencia, algo no está bien');
    logger.error('Mensaje de ERROR - Error controlado en la aplicación');
    logger.fatal('Mensaje de FATAL - Error crítico, el sistema debe detenerse');

    res.send({
        status: 'success',
        message: 'Logs generados exitosamente. Revisa la consola (desarrollo) o errors.log (producción)'
    });
});

export default router;