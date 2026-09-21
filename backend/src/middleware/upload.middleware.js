import multer from 'multer';
import config from '../config/index.js';
import { ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * File type validation
 */
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * File filter function
 */
const fileFilter = (req, file, cb) => {
  logger.debug('Validating uploaded file', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  // Check mimetype
  if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    logger.warn('File rejected - invalid mimetype', {
      filename: file.originalname,
      mimetype: file.mimetype,
      allowedTypes: allowedMimeTypes,
    });
    
    const error = new ValidationError(
      `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
    );
    return cb(error, false);
  }

  // Check file extension
  const ext = file.originalname.toLowerCase().split('.').pop();
  if (!allowedExtensions.includes(`.${ext}`)) {
    logger.warn('File rejected - invalid extension', {
      filename: file.originalname,
      extension: ext,
      allowedExtensions,
    });
    
    const error = new ValidationError(
      `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`
    );
    return cb(error, false);
  }

  cb(null, true);
};

/**
 * Multer configuration for memory storage
 * Files are stored in memory as Buffer objects
 */
const multerConfig = {
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024, // Convert MB to bytes
    files: config.upload.maxFilesPerComplaint,
  },
};

/**
 * Create multer instance
 */
const upload = multer(multerConfig);

/**
 * Middleware for single file upload
 */
export const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (error) => {
      if (error) {
        logger.error('Single file upload error', {
          error: error.message,
          code: error.code,
          field: error.field,
        });
        
        if (error instanceof multer.MulterError) {
          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              return next(new ValidationError(
                `File too large. Maximum size: ${config.upload.maxFileSizeMB}MB`
              ));
              
            case 'LIMIT_UNEXPECTED_FILE':
              return next(new ValidationError(
                `Unexpected file field. Expected: ${fieldName}`
              ));
              
            default:
              return next(new ValidationError(`Upload error: ${error.message}`));
          }
        }
        
        return next(error);
      }
      
      logger.debug('Single file upload successful', {
        filename: req.file?.originalname,
        size: req.file?.size,
      });
      
      next();
    });
  };
};

/**
 * Middleware for multiple file upload
 */
export const uploadMultiple = (fieldName = 'images', maxCount = null) => {
  const maxFiles = maxCount || config.upload.maxFilesPerComplaint;
  
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxFiles);
    
    multipleUpload(req, res, (error) => {
      if (error) {
        logger.error('Multiple file upload error', {
          error: error.message,
          code: error.code,
          field: error.field,
        });
        
        if (error instanceof multer.MulterError) {
          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              return next(new ValidationError(
                `File too large. Maximum size: ${config.upload.maxFileSizeMB}MB`
              ));
              
            case 'LIMIT_FILE_COUNT':
              return next(new ValidationError(
                `Too many files. Maximum: ${maxFiles}`
              ));
              
            case 'LIMIT_UNEXPECTED_FILE':
              return next(new ValidationError(
                `Unexpected file field. Expected: ${fieldName}`
              ));
              
            default:
              return next(new ValidationError(`Upload error: ${error.message}`));
          }
        }
        
        return next(error);
      }
      
      logger.debug('Multiple file upload successful', {
        fileCount: req.files?.length || 0,
        files: req.files?.map(f => ({
          filename: f.originalname,
          size: f.size,
        })) || [],
      });
      
      next();
    });
  };
};

/**
 * Middleware for fields with files
 */
export const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (error) => {
      if (error) {
        logger.error('Fields upload error', {
          error: error.message,
          code: error.code,
          field: error.field,
        });
        
        if (error instanceof multer.MulterError) {
          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              return next(new ValidationError(
                `File too large. Maximum size: ${config.upload.maxFileSizeMB}MB`
              ));
              
            case 'LIMIT_FILE_COUNT':
              return next(new ValidationError(
                'Too many files uploaded'
              ));
              
            case 'LIMIT_UNEXPECTED_FILE':
              return next(new ValidationError(
                'Unexpected file field'
              ));
              
            default:
              return next(new ValidationError(`Upload error: ${error.message}`));
          }
        }
        
        return next(error);
      }
      
      logger.debug('Fields upload successful', {
        fields: Object.keys(req.files || {}),
      });
      
      next();
    });
  };
};