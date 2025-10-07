import { getAllProperties } from '@/lib/propertyData';

// Validate if a property exists and belongs to the user
export function validatePropertyExists(propertyId, userId) {
  if (!propertyId) {
    return { valid: true, error: null }; // propertyId is optional
  }

  // Get all available properties
  const properties = getAllProperties();
  
  // Check if property exists
  const property = properties.find(p => p.id === propertyId);
  if (!property) {
    return {
      valid: false,
      error: `Property with ID '${propertyId}' does not exist`
    };
  }

  // In a real application, you'd also check if the property belongs to the user
  // For now, we'll assume all properties are accessible to all users
  return { valid: true, error: null };
}

// Get property details for validation
export function getPropertyDetails(propertyId) {
  if (!propertyId) {
    return null;
  }

  const properties = getAllProperties();
  return properties.find(p => p.id === propertyId) || null;
}
