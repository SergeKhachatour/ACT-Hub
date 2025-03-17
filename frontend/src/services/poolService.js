const API_URL = process.env.REACT_APP_API_URL;

export const getLiquidityPools = async () => {
  try {
    const response = await fetch(`${API_URL}/pool/list`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch liquidity pools');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Pool service error:', error);
    throw error;
  }
};

export const addLiquidity = async (data) => {
  try {
    const response = await fetch(`${API_URL}/pool/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add liquidity');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Pool service error:', error);
    throw error;
  }
};

export const removeLiquidity = async (data) => {
  try {
    const response = await fetch(`${API_URL}/pool/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove liquidity');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Pool service error:', error);
    throw error;
  }
}; 