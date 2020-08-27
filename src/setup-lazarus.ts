import * as core from '@actions/core';
import * as inst from './Installer';

const _version = '2.2.2';

async function run(): Promise<void> {
  try {
    // `lazarus-version` input defined in action metadata file
    let lazarusVersion = core.getInput('lazarus-version');

    // `include-packages-opm` input defined in action metadata file
    let includePackagesopm = core.getInput('include-packages-opm');

    // `include-packages` input defined in action metadata file
    let includePackageslocal = core.getInput('include-packages-local');

    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);

    let Installer = new inst.Installer(lazarusVersion, includePackagesopm.split(','), includePackageslocal.split(','));
    await Installer.install();

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
