import __dirname from "./index.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorios si no existen
const createDirectories = () => {
    const dirs = [
        `${__dirname}/../public/img`,
        `${__dirname}/../public/documents`,
        `${__dirname}/../public/pets`
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createDirectories();

// Configuración de storage para pets (imágenes)
const petStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, `${__dirname}/../public/pets`)
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

// Configuración de storage para documentos de usuarios
const documentStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, `${__dirname}/../public/documents`)
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuración de storage genérica (para mantener compatibilidad)
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, `${__dirname}/../public/img`)
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

// Filtros de archivo
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
};

const documentFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten documentos (pdf, doc, docx, txt)'));
    }
};

// Exportar diferentes configuraciones de multer
export const uploader = multer({ storage });
export const petUploader = multer({ 
    storage: petStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
export const documentUploader = multer({ 
    storage: documentStorage,
    fileFilter: documentFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

export default uploader;