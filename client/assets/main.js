let userIP = '';
// optional fetch to get client IP
fetch('https://api.ipify.org?format=json')
  .then(res => res.json())
  .then(data => { userIP = data.ip; })
  .catch(() => {});

const searchClient = {
  async search(requests) {
    const response = await fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': userIP
      },
      body: JSON.stringify({ requests })
    });
    return response.json();
  },
  async searchForFacetValues(requests) {
    const response = await fetch('/facet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': userIP
      },
      body: JSON.stringify({ requests })
    });
    return response.json();
  }
};

const INDEX_NAME = (window.ENV && window.ENV.INDEX_NAME) || 'products';
const REPLICA_ASC = (window.ENV && window.ENV.REPLICA_ASC) || 'products_price_asc';
const REPLICA_DESC = (window.ENV && window.ENV.REPLICA_DESC) || 'products_price_desc';

const search = instantsearch({
  indexName: INDEX_NAME,
  searchClient
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    searchAsYouType: true
  }),
  instantsearch.widgets.sortBy({
    container: '#sort-by',
    items: [
      { label: 'Price low to high', value: REPLICA_ASC },
      { label: 'Price high to low', value: REPLICA_DESC }
    ]
  }),
  instantsearch.widgets.refinementList({
    container: '#brand-list',
    attribute: 'brand'
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit) => `
        <div class="hit">
          <img src="${hit.image}" alt="${hit.name}" />
          <div>
            <div>${hit.name}</div>
            <div>$${hit.price}</div>
          </div>
        </div>`
    }
  }),
  instantsearch.widgets.pagination({ container: '#pagination' })
]);

search.start();
