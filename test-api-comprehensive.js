import https from 'https';

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

async function runComprehensiveTests() {
  console.log('🎯 Running Comprehensive API Tests...\n');
  
  let successCount = 0;
  let totalTests = 0;

  const testResults = {
    auth: false,
    endpoints: {
      getEvents: false,
      getEventDetails: false,
      searchEvents: false
    },
    dataQuality: {
      hasEvents: false,
      hasValidStructure: false,
      hasRequiredFields: false
    }
  };

  try {
    // Test 1: Basic connectivity with correct API key
    console.log('1. ✅ Testing basic connectivity with valid API key...');
    totalTests++;
    try {
      const response = await makeRequest('/v1/resources/events');
      if (response.status === 200) {
        console.log('   ✅ API authentication successful');
        testResults.auth = true;
        successCount++;
      } else {
        console.log(`   ❌ Auth failed: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Connection error:', error.message);
    }

    console.log('');

    // Test 2: Get events list
    console.log('2. ✅ Testing GET /v1/resources/events...');
    totalTests++;
    try {
      const response = await makeRequest('/v1/resources/events');
      if (response.status === 200) {
        const events = Object.values(response.data).filter(event => event && typeof event === 'object');
        console.log(`   ✅ Found ${events.length} events`);
        testResults.endpoints.getEvents = true;
        
        if (events.length > 0) {
          testResults.dataQuality.hasEvents = true;
          
          // Check data structure
          const firstEvent = events[0];
          const hasRequiredFields = firstEvent.id && firstEvent.title && firstEvent.lifetime;
          testResults.dataQuality.hasRequiredFields = hasRequiredFields;
          console.log(`   ✅ Data structure: ${hasRequiredFields ? 'Valid' : 'Invalid'}`);
          
          // Sample events
          console.log(`   📋 Sample events:`);
          events.slice(0, 3).forEach((event, index) => {
            console.log(`      ${index + 1}. ${event.title?.text || 'No title'}`);
          });
        }
        successCount++;
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('');

    // Test 3: Search with filters
    console.log('3. ✅ Testing search with filters...');
    totalTests++;
    try {
      const searchResponse = await makeRequest('/v1/resources/events?title=VNVNC');
      if (searchResponse.status === 200) {
        const events = Object.values(searchResponse.data).filter(event => event && typeof event === 'object');
        console.log(`   ✅ Found ${events.length} matching events`);
        testResults.endpoints.searchEvents = true;
        successCount++;
      } else {
        console.log(`   ❌ Search failed: ${searchResponse.status}`);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('');

    // Test 4: API key validation
    console.log('4. ✅ Testing invalid API key...');
    totalTests++;
    try {
      const wrongKeyResponse = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: BASE_URL,
          port: 443,
          path: '/v1/resources/events',
          method: 'GET',
          headers: {
            'Authorization': 'key wrong-key',
            'Content-Type': 'application/json'
          }
        }, (res) => {
          resolve({ status: res.statusCode });
        });
        req.on('error', reject);
        req.end();
      });
      
      if (wrongKeyResponse.status === 403) {
        console.log('   ✅ API key validation works correctly');
        successCount++;
      } else {
        console.log(`   ❌ Unexpected status: ${wrongKeyResponse.status}`);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('');

    // Test 5: Check specific event details (if available)
    console.log('5. ✅ Testing event details...');
    totalTests++;
    try {
      const response = await makeRequest('/v1/resources/events');
      if (response.status === 200) {
        const events = Object.values(response.data).filter(event => event && typeof event === 'object');
        if (events.length > 0) {
          const firstEvent = events[0];
          console.log(`   ✅ First event details:`);
          console.log(`      ID: ${firstEvent.id}`);
          console.log(`      Title: ${firstEvent.title?.text}`);
          console.log(`      Description: ${firstEvent.title?.desc}`);
          console.log(`      Status: ${firstEvent.status}`);
          console.log(`      Has poster: ${!!firstEvent.poster?.original}`);
          testResults.endpoints.getEventDetails = true;
          successCount++;
        } else {
          console.log('   ⚠️ No events to test details');
        }
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('');

    // Summary
    console.log('📊 TEST SUMMARY');
    console.log('================');
    console.log(`✅ Total tests passed: ${successCount}/${totalTests}`);
    console.log(`🔐 Authentication: ${testResults.auth ? '✅ Working' : '❌ Failed'}`);
    console.log(`📡 Endpoints:`);
    console.log(`   - Get Events: ${testResults.endpoints.getEvents ? '✅ Working' : '❌ Failed'}`);
    console.log(`   - Get Event Details: ${testResults.endpoints.getEventDetails ? '✅ Working' : '❌ Failed'}`);
    console.log(`   - Search Events: ${testResults.endpoints.searchEvents ? '✅ Working' : '❌ Failed'}`);
    console.log(`📊 Data Quality:`);
    console.log(`   - Has Events: ${testResults.dataQuality.hasEvents ? '✅ Yes' : '❌ No'}`);
    console.log(`   - Valid Structure: ${testResults.dataQuality.hasRequiredFields ? '✅ Yes' : '❌ No'}`);
    
    if (successCount === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! API is working correctly.');
    } else {
      console.log(`\n⚠️ ${totalTests - successCount} tests failed. Check console for details.`);
    }

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

console.log('🚀 Starting Comprehensive API Testing...\n');
runComprehensiveTests();