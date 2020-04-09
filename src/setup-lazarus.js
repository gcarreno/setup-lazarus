const core = require('@actions/core');
const github = require('@actions/github');
const installer = require('./installer');
const os = require('os');

try {
  // `lazarus-version` input defined in action metadata file
  const lazarusVersion = core.getInput('lazarus-version');
  console.log(`Lazarus version: ${lazarusVersion}`);

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const platform = os.platform();
  console.log(`Installing on platform: ${platform}`);

  switch (lazarusVersion) {
    case "dist":
      if (platform != 'win64') {
        installer.getLazarus(lazarusVersion);
      }
      break;
    default:
      console.log(`Version not supported: ${lazarusVersion}`);
      break;
  }

} catch (error) {
  core.setFailed(error.message);
}
