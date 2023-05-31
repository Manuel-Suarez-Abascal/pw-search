import chalk from 'chalk';
import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// function to perform the search in the CLI and print the results
const performSearch = async (queryTerm) => {
  // Define the data for the POST request
  let data = {
    "requests": [
      {
        "indexName": "playwright-nodejs",
        "params": `query=${queryTerm}`
      }
    ]
  };

  // Define the options for the fetch function
  let options = {
    method: 'POST',
    headers: {
      /* these headers are required for the request to work in Algolia API 
      // it's not sensitive data since it's available in the browser network tab for Playwright official docs
      */
      'Content-Type': 'application/json',
      'X-Algolia-API-Key': 'a5b64422711c37ab6a0ce4d86d16cdd9',
      'X-Algolia-Application-Id': 'K09ICMCV6X'
    },
    body: JSON.stringify(data)
  };

  // Make the POST request
  fetch('https://k09icmcv6x-dsn.algolia.net/1/indexes/*/queries', options)
    .then(response => response.json())
    .then(data => {

      // If no results are found from the search, print a message and stop execution
      if (data.results[0].nbHits === 0) {
        console.log(chalk.red('No results found!'));
        return;
      }

      // Print the number of results found & their urls to the playwright docs
      data.results[0].hits.forEach(hit => console.log(chalk.yellow(hit.url_without_anchor)) );
    })
    .catch(error => console.error('Error:', error));
}

rl.question(chalk.green('🔍 Please enter a search query: '), (answer) => {
  performSearch(answer);
  rl.close();
});
