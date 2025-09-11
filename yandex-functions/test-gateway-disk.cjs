// Test the gateway-disk function locally
const gatewayDisk = require('./gateway-disk.cjs');

// Test the photos endpoint
async function testPhotosEndpoint() {
  const event = {
    httpMethod: 'GET',
    params: {
      path: 'photos'
    },
    queryStringParameters: {
      limit: '2'
    }
  };

  console.log('Testing /api/yandex-disk/photos endpoint...');
  try {
    const result = await gatewayDisk.handler(event, {});
    console.log('Status:', result.statusCode);
    if (result.statusCode === 200) {
      const data = JSON.parse(result.body);
      console.log('Photos returned:', data.photos.length);
      console.log('Total:', data.total);
      if (data.photos.length > 0) {
        console.log('First photo:', data.photos[0]);
      }
    } else {
      console.log('Error body:', result.body);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test the dates endpoint
async function testDatesEndpoint() {
  const event = {
    httpMethod: 'GET',
    params: {
      path: 'dates'
    },
    queryStringParameters: {}
  };

  console.log('\nTesting /api/yandex-disk/dates endpoint...');
  try {
    const result = await gatewayDisk.handler(event, {});
    console.log('Status:', result.statusCode);
    if (result.statusCode === 200) {
      const data = JSON.parse(result.body);
      console.log('Dates returned:', data.dates.length);
      console.log('Dates:', data.dates);
    } else {
      console.log('Error body:', result.body);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run tests
(async () => {
  await testPhotosEndpoint();
  await testDatesEndpoint();
})();