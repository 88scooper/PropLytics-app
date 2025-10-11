/**
 * Scenario Storage Utility
 * 
 * Manages saving, loading, and deleting user-defined scenarios
 * using browser localStorage
 */

const STORAGE_KEY = 'proplytics_saved_scenarios';

/**
 * Get all saved scenarios from localStorage
 * @returns {Array} Array of saved scenario objects
 */
export function getSavedScenarios() {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading saved scenarios:', error);
    return [];
  }
}

/**
 * Save a new scenario to localStorage
 * @param {Object} scenario - Scenario object with name, assumptions, propertyId, and metadata
 * @returns {boolean} Success status
 */
export function saveScenario(scenario) {
  if (typeof window === 'undefined') return false;
  
  try {
    const scenarios = getSavedScenarios();
    
    // Create scenario with metadata
    const newScenario = {
      id: Date.now().toString(),
      name: scenario.name,
      propertyId: scenario.propertyId,
      propertyName: scenario.propertyName,
      assumptions: scenario.assumptions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    scenarios.push(newScenario);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
    
    return true;
  } catch (error) {
    console.error('Error saving scenario:', error);
    return false;
  }
}

/**
 * Update an existing scenario
 * @param {string} id - Scenario ID
 * @param {Object} updates - Updated scenario data
 * @returns {boolean} Success status
 */
export function updateScenario(id, updates) {
  if (typeof window === 'undefined') return false;
  
  try {
    const scenarios = getSavedScenarios();
    const index = scenarios.findIndex(s => s.id === id);
    
    if (index === -1) return false;
    
    scenarios[index] = {
      ...scenarios[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
    return true;
  } catch (error) {
    console.error('Error updating scenario:', error);
    return false;
  }
}

/**
 * Delete a scenario from localStorage
 * @param {string} id - Scenario ID to delete
 * @returns {boolean} Success status
 */
export function deleteScenario(id) {
  if (typeof window === 'undefined') return false;
  
  try {
    const scenarios = getSavedScenarios();
    const filtered = scenarios.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return false;
  }
}

/**
 * Get scenarios for a specific property
 * @param {string} propertyId - Property ID
 * @returns {Array} Array of scenarios for the property
 */
export function getScenariosByProperty(propertyId) {
  const scenarios = getSavedScenarios();
  return scenarios.filter(s => s.propertyId === propertyId);
}

/**
 * Get a specific scenario by ID
 * @param {string} id - Scenario ID
 * @returns {Object|null} Scenario object or null if not found
 */
export function getScenarioById(id) {
  const scenarios = getSavedScenarios();
  return scenarios.find(s => s.id === id) || null;
}

/**
 * Check if a scenario name already exists for a property
 * @param {string} name - Scenario name
 * @param {string} propertyId - Property ID
 * @returns {boolean} True if name exists
 */
export function scenarioNameExists(name, propertyId) {
  const scenarios = getScenariosByProperty(propertyId);
  return scenarios.some(s => s.name.toLowerCase() === name.toLowerCase());
}

/**
 * Export all scenarios as JSON (for backup)
 * @returns {string} JSON string of all scenarios
 */
export function exportScenarios() {
  const scenarios = getSavedScenarios();
  return JSON.stringify(scenarios, null, 2);
}

/**
 * Import scenarios from JSON (for restore)
 * @param {string} jsonString - JSON string of scenarios
 * @returns {boolean} Success status
 */
export function importScenarios(jsonString) {
  if (typeof window === 'undefined') return false;
  
  try {
    const imported = JSON.parse(jsonString);
    if (!Array.isArray(imported)) {
      throw new Error('Invalid scenarios data');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    return true;
  } catch (error) {
    console.error('Error importing scenarios:', error);
    return false;
  }
}

