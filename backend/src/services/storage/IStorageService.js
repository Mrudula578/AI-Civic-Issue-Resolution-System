/**
 * Interface for storage services
 * Defines the contract that all storage implementations must follow
 */
export class IStorageService {
  /**
   * Upload a file and return its URL
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} filename - The filename
   * @param {string} mimetype - The file mimetype
   * @returns {Promise<string>} The URL of the uploaded file
   */
  async uploadFile(fileBuffer, filename, mimetype) {
    throw new Error('uploadFile method must be implemented');
  }

  /**
   * Delete a file
   * @param {string} fileUrl - The URL or path of the file to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteFile(fileUrl) {
    throw new Error('deleteFile method must be implemented');
  }

  /**
   * Get the full URL for accessing a file
   * @param {string} filePath - The relative file path
   * @returns {string} The full URL
   */
  getFileUrl(filePath) {
    throw new Error('getFileUrl method must be implemented');
  }

  /**
   * Check if a file exists
   * @param {string} filePath - The file path
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(filePath) {
    throw new Error('fileExists method must be implemented');
  }
}