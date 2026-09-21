import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService } from './IStorageService.js';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LocalStorageService extends IStorageService {
  constructor() {
    super();
    this.uploadDir = path.resolve(config.upload.dir);
    this.ensureUploadDirExists();
  }

  /**
   * Ensure upload directory exists
   */
  async ensureUploadDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      logger.info('Creating upload directory', { dir: this.uploadDir });
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Generate a unique filename
   */
  generateFilename(originalFilename, mimetype) {
    const uuid = uuidv4();
    const ext = this.getFileExtension(originalFilename, mimetype);
    return `${uuid}${ext}`;
  }

  /**
   * Get file extension from filename or mimetype
   */
  getFileExtension(filename, mimetype) {
    // First try to get extension from filename
    const filenameExt = path.extname(filename).toLowerCase();
    if (filenameExt) {
      return filenameExt;
    }

    // Fallback to mimetype mapping
    const mimetypeMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };

    return mimetypeMap[mimetype] || '.bin';
  }

  /**
   * Upload a file to local storage
   */
  async uploadFile(fileBuffer, originalFilename, mimetype) {
    try {
      await this.ensureUploadDirExists();

      const filename = this.generateFilename(originalFilename, mimetype);
      const filePath = path.join(this.uploadDir, filename);
      
      // Write file to disk
      await fs.writeFile(filePath, fileBuffer);

      // Return relative path (for storing in database)
      const relativePath = `/uploads/${filename}`;
      
      logger.info('File uploaded successfully', {
        originalFilename,
        filename,
        size: fileBuffer.length,
        mimetype,
      });

      return relativePath;
    } catch (error) {
      logger.error('File upload failed', {
        originalFilename,
        mimetype,
        error: error.message,
      });
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from local storage
   */
  async deleteFile(fileUrl) {
    try {
      // Extract filename from URL (remove /uploads/ prefix)
      const filename = fileUrl.replace('/uploads/', '');
      const filePath = path.join(this.uploadDir, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        logger.warn('File not found for deletion', { fileUrl, filePath });
        return false; // File doesn't exist, consider it "deleted"
      }

      // Delete file
      await fs.unlink(filePath);
      
      logger.info('File deleted successfully', { fileUrl, filename });
      return true;
    } catch (error) {
      logger.error('File deletion failed', {
        fileUrl,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get full URL for a file
   */
  getFileUrl(filePath) {
    // For local storage, the file path is already the URL path
    // The Express static middleware serves files at /uploads/*
    return filePath;
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath) {
    try {
      const filename = filePath.replace('/uploads/', '');
      const fullPath = path.join(this.uploadDir, filename);
      await fs.access(fullPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file info (size, mimetype, etc.)
   */
  async getFileInfo(filePath) {
    try {
      const filename = filePath.replace('/uploads/', '');
      const fullPath = path.join(this.uploadDir, filename);
      const stats = await fs.stat(fullPath);
      
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      logger.error('Failed to get file info', {
        filePath,
        error: error.message,
      });
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }
}