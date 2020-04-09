//const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const os = require('os');
const cp = require('child_process');

const platform = os.platform();

export function getLazarus(version) {
  console.log(`getLazarus - Installing Lazarus version:  ${version}`);

  const installDir = tc.find('lazarus');
  console.log(`getLazarus - Tool Cache install dir: ${installDir}`);

  switch (version) {
    case "dist":
      if (platform != 'win32') {
          console.log('getLazarus - Installing Lazarus now');
          downloadLazarus(version);
      } else {
        // Use the latest known stable version
        downloadLazarus('2.0.6');
      }
      break;
    case '2.0.6':
      downloadLazarus(version, '3.0.4');
      break;
    case '2.0.4':
      downloadLazarus(version, '3.0.4');
      break;
    default:
      throw new Error(`getLazarus - Version not supported: ${lazarusVersion}`);
      break;
  }
}

function downloadLazarus(versionLaz, versionFPC) {
  console.log(`downloadLazarus - Installing on platform: ${platform}`);

  switch (platform) {
    case 'win32':
      const downloadURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Windows%2032%20bits/Lazarus%20${version}/lazarus-${versionLaz}-fpc-${versionFPC}-win32.exe`;
      console.log(`downloadLazarus - Downloading ${downloadURL}`);

      const downloadPath_WIN = tc.downloadTool(downloadURL);
      console.log(`downloadLazarus - Downloaded into ${downloadPath_WIN}`);

      break;
    case 'linux':
      const downloadLazURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${version}/lazarus-project_${version}-0_amd64.deb`;
      const downloadFPCURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${version}/fpc-laz_${versionFPC}-1_amd64.deb`;
      const downloadFPCSRCURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${version}/fpc-src_{versionFPC}-2_amd64.deb`;
      console.log(`downloadLazarus - Downloading ${downloadLazURL}`);

      const downloadPath_LIN = tc.downloadTool(downloadLazURL);
      console.log(`downloadLazarus - Downloaded into ${downloadPath_LIN}`);

      const dpkgRes = cp.execSync(`dpkg -i ${downloadPath}`);
      console.log(`downloadLazarus - Package install result: ${dpkgRes}`);

      break;
    default:
      throw new Error(`downloadLazarus - Platform not implemented yet: ${platform}`);
      break;
  }
}
