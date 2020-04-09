import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as cp from 'child_process';

const platform = os.platform();

export async function getLazarus(version) {
  console.log(`getLazarus - Installing Lazarus version:  ${version}`);

  //const installDir = tc.find('lazarus', version);
  //console.log(`getLazarus - Tool Cache install dir: ${installDir}`);

  switch (version) {
    case "dist":
      if (platform != 'win32') {
          console.log('getLazarus - Installing Lazarus dist');
          //downloadLazarus(version);
      } else {
        // Use the latest known stable version
        downloadLazarus('2.0.6', '3.0.4');
      }
      break;
    case '2.0.6':
      downloadLazarus(version, '3.0.4');
      break;
    case '2.0.4':
      downloadLazarus(version, '3.0.4');
      break;
    default:
      throw new Error(`getLazarus - Version not supported: ${version}`);
      break;
  }
}

async function downloadLazarus(versionLaz, versionFPC) {
  console.log(`downloadLazarus - Installing on platform: ${platform}`);

  switch (platform) {
    case 'win32':
      let downloadURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Windows%2032%20bits/Lazarus%20${versionLaz}/lazarus-${versionLaz}-fpc-${versionFPC}-win32.exe`;
      console.log(`downloadLazarus - Downloading ${downloadURL}`);

      let downloadPath_WIN = tc.downloadTool(downloadURL);
      console.log(`downloadLazarus - Downloaded into ${downloadPath_WIN}`);

      break;
    case 'linux':
      let downloadLazURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${versionLaz}/lazarus-project_${versionLaz}-0_amd64.deb`;
      let downloadFPCURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${versionLaz}/fpc-laz_${versionFPC}-1_amd64.deb`;
      let downloadFPCSRCURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${versionLaz}/fpc-src_{versionFPC}-2_amd64.deb`;
      console.log(`downloadLazarus - Downloading ${downloadLazURL}`);

      let downloadPath_LIN = tc.downloadTool(downloadLazURL);
      console.log(`downloadLazarus - Downloaded into ${downloadPath_LIN}`);

      let dpkgRes = cp.execSync(`dpkg -i ${downloadPath_LIN}`);
      console.log(`downloadLazarus - Package install result: ${dpkgRes}`);

      break;
    default:
      throw new Error(`downloadLazarus - Platform not implemented yet: ${platform}`);
      break;
  }
}
