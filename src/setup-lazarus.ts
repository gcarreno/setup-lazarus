import * as core from '@actions/core';
import * as installer from './installer';

async function run(): Promise<void> {
  try {
    // `lazarus-version` input defined in action metadata file
    let lazarusVersion = core.getInput('lazarus-version');

    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);

    // Call the installation of Lazarus
    await installer.getLazarus(lazarusVersion);

    // `include-packages` input defined in action metadata file
    let includePackages = core.getInput('include-packages');

    // Transform string into array of strings
    let packages: string[] = includePackages.split(',');

    // Call the instalation of packages
    await installer.getPackages(lazarusVersion, packages);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
