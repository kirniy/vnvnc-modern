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

export const api = {
  async submitBooking(data: BookingData): Promise<{ success: boolean; message?: string }> {
    try {
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
      const response = await fetch(`${WORKER_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit contact form');
      }

      return result;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }
};