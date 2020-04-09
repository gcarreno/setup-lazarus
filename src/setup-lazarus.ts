import * as core from '@actions/core';
import * as github from '@actions/github';
import * as installer from './installer';

async function run(){
  try {
    // `lazarus-version` input defined in action metadata file
    let lazarusVersion = core.getInput('lazarus-version');

    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);

    installer.getLazarus(lazarusVersion);

  } catch (error) {
    core.setFailed(error.message);
  }
}


run();
