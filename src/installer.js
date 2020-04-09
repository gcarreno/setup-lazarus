//const core = require('@actions/core');
const os = require('os');

export function getLazarus(version) {
  console.log(`getLazarus - Installing Lazarus version:  ${version}`);

  switch (lazarusVersion) {
    case "dist":
      if (platform != 'win32') {
          console.log('Installing Lazarus now');
      }
      break;
    default:
      console.log(`Version not supported: ${lazarusVersion}`);
      break;
  }
}
