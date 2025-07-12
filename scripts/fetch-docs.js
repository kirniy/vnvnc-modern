const FirecrawlApp = require('@mendable/firecrawl-js');

const app = new FirecrawlApp({
  apiKey: 'fc-530b2aab4eec4f01b1e72e8bfe7b8907'
});

async function fetchTicketsCloudDocs() {
  console.log('Fetching Tickets Cloud documentation...');
  
  try {
    // Main documentation
    const mainDocs = await app.scrapeUrl('https://ticketscloud.readthedocs.io/ru/latest/', {
      formats: ['markdown'],
      includeTags: ['div.document', 'div.section'],
      excludeTags: ['nav', 'footer', 'header']
    });

    // API basics
    const apiBasics = await app.scrapeUrl('https://ticketscloud.readthedocs.io/ru/latest/walkthrough/basics.html', {
      formats: ['markdown'],
      includeTags: ['div.document', 'div.section'],
      excludeTags: ['nav', 'footer', 'header']
    });

    // Events documentation
    const eventsDocs = await app.scrapeUrl('https://ticketscloud.readthedocs.io/ru/latest/walkthrough/events.html', {
      formats: ['markdown'],
      includeTags: ['div.document', 'div.section'],
      excludeTags: ['nav', 'footer', 'header']
    });

    // Orders documentation
    const ordersDocs = await app.scrapeUrl('https://ticketscloud.readthedocs.io/ru/latest/walkthrough/orders.html', {
      formats: ['markdown'],
      includeTags: ['div.document', 'div.section'],
      excludeTags: ['nav', 'footer', 'header']
    });

    const docs = {
      main: mainDocs.success ? mainDocs.data.markdown : '',
      apiBasics: apiBasics.success ? apiBasics.data.markdown : '',
      events: eventsDocs.success ? eventsDocs.data.markdown : '',
      orders: ordersDocs.success ? ordersDocs.data.markdown : ''
    };

    console.log('Documentation fetched successfully!');
    console.log('Main docs length:', docs.main.length);
    console.log('API basics length:', docs.apiBasics.length);
    console.log('Events docs length:', docs.events.length);
    console.log('Orders docs length:', docs.orders.length);

    return docs;
  } catch (error) {
    console.error('Error fetching docs:', error);
    return null;
  }
}

if (require.main === module) {
  fetchTicketsCloudDocs().then(docs => {
    if (docs) {
      require('fs').writeFileSync('./ticketscloud-docs.json', JSON.stringify(docs, null, 2));
      console.log('Documentation saved to ticketscloud-docs.json');
    }
  });
}

module.exports = { fetchTicketsCloudDocs };