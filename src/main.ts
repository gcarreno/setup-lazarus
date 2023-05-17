import * as core from '@actions/core';
import * as inst from './Installer';

async function run(): Promise<void> {
  try {
    // `lazarus-version` input defined in action metadata file
    let lazarusVersion = core.getInput('lazarus-version');

    // `include-packages` input defined in action metadata file
    let includePackages = core.getInput('include-packages');

    // `with-cache` input defined in action metadata file
    let withCache = core.getInput('with-cache') == 'true';

    let Installer = new inst.Installer(lazarusVersion, includePackages.split(','), withCache);
    await Installer.install();

  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();

export default run;
