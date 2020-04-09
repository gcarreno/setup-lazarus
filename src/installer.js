//const core = require('@actions/core');
const os = require('os');

export function getLazarus(version) {
  console.log(`getLazarus - Installing Lazarus version:  ${version}`);

  switch (version) {
    case "dist":
      if (platform != 'win32') {
          console.log('getLazarus - Installing Lazarus now');
      } else {
        downloadLazarus('2.0.6');
      }
      break;
    case '2.0.6':
    case '2.0.4':
      downloadLazarus(version);
      break;
    default:
      console.log(`getLazarus - Version not supported: ${lazarusVersion}`);
      break;
  }
}

function downloadLazarus(version) {
  const platform = os.platform();
  console.log(`downloadLazarus - Installing on platform: ${platform}`);

  switch (platform) {
    case 'win32':
      console.log('');
      break;
    case 'linux':
      break;
    default:
      console.log(`downloadLazarus - Platform not implemented yet: ${platform}`);
      break;
  }
}
