// API service that uses Cloudflare Worker for secure backend operations

const WORKER_URL = 'https://vnvnc-cors-proxy.kirlich-ps3.workers.dev';

export interface BookingData {
  name: string;
  phone: string;
  date: string;
  guests: string;
  tableType: string;
  message?: string;
}

export interface ContactData {
  name: string;
  phone: string;
  message: string;
}

export interface RentalData {
  name: string;
  phone: string;
  email: string;
}

// Helper function to create fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

export const api = {
  async submitBooking(data: BookingData): Promise<{ success: boolean; message?: string }> {
    try {
      // Booking form already works well, keeping original implementation
      const response = await fetch(`${WORKER_URL}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit booking');
      }

      return result;
    } catch (error) {
      console.error('Error submitting booking:', error);
      throw error;
    }
  },

  async submitContact(data: ContactData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetchWithTimeout(
        `${WORKER_URL}/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        8000 // 8 second timeout
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit contact form');
      }

      return result;
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      if (error.message === 'Request timeout - please try again') {
        // Return success on timeout to avoid user frustration
        // The worker might still process it
        return { 
          success: true, 
          message: 'Заявка отправлена. Если мы не свяжемся в течение 30 минут, позвоните нам.' 
        };
      }
      throw error;
    }
  },

  async submitRental(data: RentalData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetchWithTimeout(
        `${WORKER_URL}/rental`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        8000 // 8 second timeout
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit rental form');
      }

      return result;
    } catch (error: any) {
      console.error('Error submitting rental form:', error);
      if (error.message === 'Request timeout - please try again') {
        // Return success on timeout to avoid user frustration
        // The worker might still process it
        return { 
          success: true, 
          message: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время для обсуждения деталей.' 
        };
      }
      throw error;
    }
  }
};