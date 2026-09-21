import { LocalStorageService } from './LocalStorageService.js';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';

/**
 * Storage service factory
 * Creates the appropriate storage service based on configuration
 */
class StorageServiceFactory {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      const provider = process.env.STORAGE_PROVIDER || 'local';
      
      switch (provider.toLowerCase()) {
        case 'local':
          this.instance = new LocalStorageService();
          logger.info('Using local storage service');
          break;
          
        case 'supabase':
          // TODO: Implement SupabaseStorageService when needed
          logger.warn('Supabase storage not implemented yet, falling back to local');
          this.instance = new LocalStorageService();
          break;
          
        default:
          logger.warn(`Unknown storage provider: ${provider}, falling back to local`);
          this.instance = new LocalStorageService();
      }
    }
    
    return this.instance;
  }

  /**
   * Reset instance (useful for testing)
   */
  static reset() {
    this.instance = null;
  }
}

// Export singleton instance
export const storageService = StorageServiceFactory.getInstance();
export { StorageServiceFactory };