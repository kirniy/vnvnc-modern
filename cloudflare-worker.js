/**
 * Cloudflare Worker CORS Proxy for TicketsCloud API
 * 
 * This worker acts as a CORS proxy to bypass browser CORS restrictions
 * when calling the TicketsCloud API from the frontend.
 * 
 * Deploy this to Cloudflare Workers and set TC_KEY as an environment variable.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle preflight CORS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // Only allow /api/* paths
    if (!url.pathname.startsWith('/api/')) {
      return new Response('Not found', {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    // Map /api/v1/* → /v1/*
    const apiPath = url.pathname.replace('/api/', '/');
    
    // Extract API key from query parameters
    const apiKey = url.searchParams.get('key');
    
    // Remove key from query string to avoid duplication
    url.searchParams.delete('key');
    const targetUrl = 'https://ticketscloud.com' + apiPath + url.search;

    console.log('Proxying to:', targetUrl, 'with key:', apiKey ? 'present' : 'missing');

    const ticketsCloudResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Authorization': `key ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: request.body
    });

    const body = await ticketsCloudResponse.text();

    return new Response(body, {
      status: ticketsCloudResponse.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
};