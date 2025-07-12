import { ticketsCloudService } from './dist/assets/ticketsCloud-DMF71YPm.js';

async function testApiResponse() {
  console.log('Fetching events from Tickets Cloud API...');
  try {
    const events = await ticketsCloudService.getEvents();
    console.log('API Response (first 5 events):', JSON.stringify(events.slice(0, 5), null, 2));
    console.log('Total events fetched:', events.length);
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

testApiResponse();