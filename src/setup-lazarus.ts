import * as core from '@actions/core';
import * as inst from './Installer';

const _version = '2.2.2';

async function run(): Promise<void> {
  try {
    // `lazarus-version` input defined in action metadata file
    let lazarusVersion = core.getInput('lazarus-version');

    // `include-packages` input defined in action metadata file
    let includePackages = core.getInput('include-packages');

    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);

    let Installer = new inst.Installer(lazarusVersion, includePackages.split(','));
    await Installer.install();

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
