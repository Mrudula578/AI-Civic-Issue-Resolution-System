import prisma from '../config/database.js';

/**
 * Generate a unique reference ID for complaints
 * Format: CR000001, CR000002, etc.
 */
export async function generateComplaintReferenceId() {
  // Get the count of existing complaints to determine the next number
  const count = await prisma.complaint.count();
  
  // Generate next sequential number (starting from 1)
  const nextNumber = count + 1;
  
  // Format with CR prefix and zero-padded 6 digits
  const referenceId = `CR${nextNumber.toString().padStart(6, '0')}`;
  
  return referenceId;
}