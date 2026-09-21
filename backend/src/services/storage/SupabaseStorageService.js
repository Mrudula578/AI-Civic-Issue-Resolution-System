import { IStorageService } from './IStorageService.js';
import logger from '../../utils/logger.js';

/**
 * Supabase Storage Service (placeholder implementation)
 * TODO: Implement when Supabase storage is needed
 */
export class SupabaseStorageService extends IStorageService {
  constructor() {
    super();
    logger.warn('SupabaseStorageService is not implemented yet');
    throw new Error('Supabase storage service is not implemented. Use local storage instead.');
  }

  async uploadFile(fileBuffer, filename, mimetype) {
    throw new Error('Supabase storage not implemented');
  }

  async deleteFile(fileUrl) {
    throw new Error('Supabase storage not implemented');
  }

  getFileUrl(filePath) {
    throw new Error('Supabase storage not implemented');
  }

  async fileExists(filePath) {
    throw new Error('Supabase storage not implemented');
  }
}

// TODO: Implementation would include:
// - Supabase client initialization
// - Bucket configuration
// - File upload to Supabase Storage
// - File deletion from Supabase Storage  
// - URL generation for Supabase hosted files
// - File existence checking
// - Error handling specific to Supabase API