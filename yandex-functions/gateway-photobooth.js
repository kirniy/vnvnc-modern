// Yandex Cloud Function for listing photobooth photos from Selectel S3
// Uses S3 ListObjectsV2 with credentials (anonymous listing not supported by Selectel)

const https = require('https');
const crypto = require('crypto');
const { URL } = require('url');

const S3_ENDPOINT = 's3.ru-7.storage.selcloud.ru';
const BUCKET = 'vnvnc';
const PUBLIC_BASE = 'https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru';
const REGION = 'ru-7';
const SERVICE = 's3';

// Credentials are passed via environment variables
// Set them when creating the function version:
//   SELECTEL_ACCESS_KEY, SELECTEL_SECRET_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60'
};

// AWS Signature V4 signing
function hmacSHA256(key, msg) {
  return crypto.createHmac('sha256', key).update(msg, 'utf8').digest();
}

function sha256(data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function getSignatureKey(secretKey, dateStamp, region, service) {
  const kDate = hmacSHA256('AWS4' + secretKey, dateStamp);
  const kRegion = hmacSHA256(kDate, region);
  const kService = hmacSHA256(kRegion, service);
  return hmacSHA256(kService, 'aws4_request');
}

function signRequest(method, path, queryString, headers, payload, accessKey, secretKey) {
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, '').slice(0, 8);
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

  headers['x-amz-date'] = amzDate;
  headers['x-amz-content-sha256'] = sha256(payload);

  const signedHeaderKeys = Object.keys(headers).sort().map(k => k.toLowerCase());
  const signedHeaders = signedHeaderKeys.join(';');
  const canonicalHeaders = signedHeaderKeys.map(k => `${k}:${headers[k]}\n`).join('');

  const canonicalRequest = [
    method,
    path,
    queryString,
    canonicalHeaders,
    signedHeaders,
    sha256(payload)
  ].join('\n');

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest)
  ].join('\n');

  const signingKey = getSignatureKey(secretKey, dateStamp, REGION, SERVICE);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

  headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return headers;
}

async function makeSignedRequest(path, queryString, accessKey, secretKey) {
  const headers = {
    'host': S3_ENDPOINT,
  };

  signRequest('GET', path, queryString, headers, '', accessKey, secretKey);

  return new Promise((resolve, reject) => {
    const url = `https://${S3_ENDPOINT}${path}?${queryString}`;
    const urlObj = new URL(url);

    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: Buffer.concat(chunks).toString('utf-8')
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function parseS3XmlListing(xml) {
  const photos = [];
  // Simple XML parsing for S3 ListObjectsV2 response
  const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
  let match;

  while ((match = contentsRegex.exec(xml)) !== null) {
    const block = match[1];
    const key = (block.match(/<Key>(.*?)<\/Key>/) || [])[1] || '';
    const lastModified = (block.match(/<LastModified>(.*?)<\/LastModified>/) || [])[1] || '';
    const size = parseInt((block.match(/<Size>(.*?)<\/Size>/) || [])[1] || '0', 10);

    if (!key || key.endsWith('/') || size < 1000) continue;
    if (!key.endsWith('.png') && !key.endsWith('.jpg') && !key.endsWith('.jpeg')) continue;

    photos.push({
      key,
      url: `${PUBLIC_BASE}/${key}`,
      lastModified,
      size
    });
  }

  // Sort newest first
  photos.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

  return photos;
}

module.exports.handler = async function (event, context) {
  const httpMethod = event.httpMethod || 'GET';

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const accessKey = process.env.SELECTEL_ACCESS_KEY;
  const secretKey = process.env.SELECTEL_SECRET_KEY;

  if (!accessKey || !secretKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'S3 credentials not configured' })
    };
  }

  try {
    const queryParams = event.queryStringParameters || {};
    const prefix = queryParams.prefix || 'artifact/photobooth/';
    const maxKeys = parseInt(queryParams.maxKeys) || 200;

    const queryString = `list-type=2&max-keys=${maxKeys}&prefix=${encodeURIComponent(prefix)}`;
    const response = await makeSignedRequest(`/${BUCKET}`, queryString, accessKey, secretKey);

    if (response.status !== 200) {
      console.error('S3 listing failed:', response.status, response.body);
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'S3 listing failed', status: response.status })
      };
    }

    const photos = parseS3XmlListing(response.body);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ photos, total: photos.length })
    };
  } catch (error) {
    console.error('Photobooth listing error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
