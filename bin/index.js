#!/usr/bin/env node
import chalk from 'chalk';
import fetch from 'node-fetch';
import keypress from 'keypress';
import { stdout } from 'process';

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

const searchPrompt = '🔍 Please enter a search query: ';
const exitPrompt = 'Press CTRL + C to exit search.';
let searchString = '';

console.log(chalk.green(searchPrompt));

// Hide the cursor
process.stdout.write("\x1B[?25l");

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  } else if (key && key.name == 'backspace') {
    searchString = searchString.slice(0, searchString.length - 1);
  } else if (ch) {
    searchString += ch;
  }

  stdout.write('\x1Bc'); // Clear console
  console.log(chalk.green(searchPrompt), searchString);

  // Hide the cursor
  process.stdout.write("\x1B[?25l");

  if (searchString.length > 0) {
    performSearch(searchString);
  }
});

// function to perform the search in the CLI and print the results
const performSearch = async (queryTerm) => {
  // Define the data for the POST request
  let data = {
    "requests": [
      {
        "indexName": "playwright-nodejs",
        "params": `query=${queryTerm}&hitsPerPage=5`
      }
    ]
  };

  // Define the options for the fetch function
  let options = {
    method: 'POST',
    headers: {
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

        // Hide the cursor
        process.stdout.write("\x1B[?25l");
        return;
      }

      // Print the number of results found & their urls to the playwright docs
      data.results[0].hits.forEach(hit => {
        const baseURL = hit.url_without_anchor;
        console.log(chalk.yellow(baseURL));
  
        Object.values(hit.hierarchy).forEach(section => {
          if (section) {
            let currentURL = `${baseURL}#${section.toLowerCase().split(' ').join('-')}`;
            console.log(chalk.yellow(currentURL));
          }
        });
      });
      
      console.log(chalk.red(exitPrompt));

      // Hide the cursor
      process.stdout.write("\x1B[?25l");
    })
    .catch(error => console.error('Error:', error));
}

process.stdin.setRawMode(true);
process.stdin.resume();

// Make sure to show the cursor before your application exits
process.on('exit', () => {
  process.stdout.write("\x1B[?25h");
});
