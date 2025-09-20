import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

// API base URL
const API_BASE = '/api/mortgages';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // In a real app, you'd get the token from your auth context
  // For now, we'll use a mock token since we're using mock authentication
  return {
    'Authorization': 'Bearer mock-token',
    'Content-Type': 'application/json',
  };
};

// Fetch all mortgages for the authenticated user
export function useMortgages(propertyId = null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mortgages', user?.uid, propertyId],
    queryFn: async () => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const url = propertyId 
        ? `${API_BASE}?propertyId=${propertyId}`
        : API_BASE;
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch mortgages: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch mortgages');
      }

      return data.data;
    },
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Fetch a single mortgage
export function useMortgage(mortgageId) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mortgage', user?.uid, mortgageId],
    queryFn: async () => {
      if (!user?.uid || !mortgageId) {
        throw new Error('User not authenticated or mortgage ID missing');
      }

      const response = await fetch(`${API_BASE}/${mortgageId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch mortgage: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch mortgage');
      }

      return data.data;
    },
    enabled: !!user?.uid && !!mortgageId,
  });
}

// Create a new mortgage
export function useCreateMortgage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (mortgageData) => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(mortgageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create mortgage');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create mortgage');
      }

      return data.data;
    },
    onSuccess: (newMortgage) => {
      // Invalidate and refetch mortgages
      queryClient.invalidateQueries({ queryKey: ['mortgages', user?.uid] });
      
      // If the mortgage is linked to a property, also invalidate that property's mortgages
      if (newMortgage.propertyId) {
        queryClient.invalidateQueries({ 
          queryKey: ['mortgages', user?.uid, newMortgage.propertyId] 
        });
      }
    },
  });
}

// Update a mortgage
export function useUpdateMortgage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ mortgageId, mortgageData }) => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE}/${mortgageId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(mortgageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update mortgage');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update mortgage');
      }

      return data.data;
    },
    onSuccess: (updatedMortgage) => {
      // Update the specific mortgage in cache
      queryClient.setQueryData(
        ['mortgage', user?.uid, updatedMortgage.id], 
        updatedMortgage
      );
      
      // Invalidate mortgages list to refetch
      queryClient.invalidateQueries({ queryKey: ['mortgages', user?.uid] });
      
      // If the mortgage is linked to a property, also invalidate that property's mortgages
      if (updatedMortgage.propertyId) {
        queryClient.invalidateQueries({ 
          queryKey: ['mortgages', user?.uid, updatedMortgage.propertyId] 
        });
      }
    },
  });
}

// Delete a mortgage
export function useDeleteMortgage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (mortgageId) => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE}/${mortgageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete mortgage');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete mortgage');
      }

      return mortgageId;
    },
    onSuccess: (deletedMortgageId) => {
      // Remove the mortgage from cache
      queryClient.removeQueries({ queryKey: ['mortgage', user?.uid, deletedMortgageId] });
      
      // Invalidate mortgages list to refetch
      queryClient.invalidateQueries({ queryKey: ['mortgages', user?.uid] });
    },
  });
}

// Calculate mortgage payment
export function useCalculateMortgage() {
  return useMutation({
    mutationFn: async (mortgageData) => {
      const response = await fetch(`${API_BASE}/calculate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(mortgageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate mortgage');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate mortgage');
      }

      return data.data;
    },
  });
}

// Analyze prepayment scenarios
export function usePrepaymentAnalysis() {
  return useMutation({
    mutationFn: async (analysisData) => {
      const response = await fetch(`${API_BASE}/prepayment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze prepayment');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze prepayment');
      }

      return data.data;
    },
  });
}

// Analyze refinance scenarios
export function useRefinanceAnalysis() {
  return useMutation({
    mutationFn: async (analysisData) => {
      const response = await fetch(`${API_BASE}/refinance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze refinance');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze refinance');
      }

      return data.data;
    },
  });
}
