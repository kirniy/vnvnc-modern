import https from 'https';

// Test script to verify Tickets Cloud API connectivity
const API_KEY = 'c862e40ed178486285938dda33038e30';
const BASE_URL = 'ticketscloud.com';

function makeRequest(path, method = 'GET', data = null) {
  const options = {
    hostname: BASE_URL,
    port: 443,
    path: path,
    method: method,
    headers: {
      'Authorization': `key ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Tickets Cloud API...\n');
  
  try {
    // Test 1: Get events - testing v1 endpoint
    console.log('1. Testing GET /v1/resources/events...');
    try {
      const eventsResponse = await makeRequest('/v1/resources/events');
      console.log('   ✅ Status:', eventsResponse.status);
      console.log('   ✅ Response type:', typeof eventsResponse.data);
      if (eventsResponse.status === 200) {
        const events = Object.values(eventsResponse.data).filter(event => event && typeof event === 'object');
        console.log('   ✅ Events found:', events.length);
        if (events.length > 0) {
          console.log('   ✅ Sample event:', events[0].title?.text || 'No title');
        }
      } else {
        console.log('   ❌ Response:', eventsResponse.data);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
    console.log('');
    
    // Test 2: Get specific event (if exists)
    console.log('2. Testing GET /v1/resources/events/{id}...');
    try {
      const eventResponse = await makeRequest('/v1/resources/events/sample-event-id');
      console.log('   ✅ Status:', eventResponse.status);
      if (eventResponse.status === 200) {
        console.log('   ✅ Event found:', eventResponse.data.title?.text || 'No title');
      } else {
        console.log('   ❌ Response:', eventResponse.data);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
    console.log('');
    
    // Test 3: Search events using v1 with title filter
    console.log('3. Testing GET /v1/resources/events with title filter...');
    try {
      const searchResponse = await makeRequest('/v1/resources/events?title=concert');
      console.log('   ✅ Status:', searchResponse.status);
      if (searchResponse.status === 200) {
        const events = Object.values(searchResponse.data).filter(event => event && typeof event === 'object');
        console.log('   ✅ Events found:', events.length);
        if (events.length > 0) {
          console.log('   ✅ Sample search result:', events[0].title?.text || 'No title');
        }
      } else {
        console.log('   ❌ Response:', searchResponse.data);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
    console.log('');
    
    // Test 4: Test with wrong API key
    console.log('4. Testing with invalid API key...');
    try {
      const wrongKeyOptions = {
        hostname: BASE_URL,
        port: 443,
        path: '/v1/resources/events',
        method: 'GET',
        headers: {
          'Authorization': 'key wrong-key',
          'Content-Type': 'application/json'
        }
      };
      
      const wrongKeyResponse = await new Promise((resolve, reject) => {
        const req = https.request(wrongKeyOptions, (res) => {
          resolve({ status: res.statusCode });
        });
        req.on('error', reject);
        req.end();
      });
      
      console.log('   ✅ Status with wrong key:', wrongKeyResponse.status);
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

console.log('🔍 Running Tickets Cloud API Tests...\n');
testAPI();