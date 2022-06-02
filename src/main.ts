import * as core from '@actions/core';
import * as inst from './Installer';

import { _version } from './constants';

async function run(): Promise<void> {
  try {
    // `lazarus-version` input defined in action metadata file
    let lazarusVersion = core.getInput('lazarus-version');

    // `include-packages` input defined in action metadata file
    let includePackages = core.getInput('include-packages');

    // `with-cache` input defined in action metadata file
    let withCache = core.getInput('with-cache') == 'true';

    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);

    let Installer = new inst.Installer(lazarusVersion, includePackages.split(','), withCache);
    await Installer.install();

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

export default run;
