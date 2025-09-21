// Shared mock data storage for development
export let mockMortgages = [];

export function addMockMortgage(mortgage) {
  mockMortgages.push(mortgage);
}

export function getMockMortgagesByUser(userId) {
  return mockMortgages.filter(mortgage => mortgage.userId === userId);
}
