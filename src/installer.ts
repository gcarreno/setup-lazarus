import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as cp from 'child_process';

export async function getLazarus(version) {
  console.log(`getLazarus - Installing Lazarus version:  ${version}`);

  //let installDir = tc.find('lazarus', version);
  //console.log(`getLazarus - Tool Cache install dir: ${installDir}`);

  switch (version) {
    case "dist":
      let platform = os.platform();
      if (platform != 'win32') {
          console.log('getLazarus - Installing Lazarus dist');
          //downloadLazarus(version);
      } else {
        // Use the latest known stable version
        await downloadLazarus('2.0.6', '3.0.4');
      }
      break;
    case '2.0.6':
      await downloadLazarus(version, '3.0.4');
      break;
    case '2.0.4':
      await downloadLazarus(version, '3.0.4');
      break;
    default:
      throw new Error(`getLazarus - Version not supported: ${version}`);
      break;
  }
}

async function downloadLazarus(versionLaz, versionFPC) {
  let platform = os.platform();
  console.log(`downloadLazarus - Installing on platform: ${platform}`);


  switch (platform) {
    case 'win32':
      let downloadURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Windows%2032%20bits/Lazarus%20${versionLaz}/lazarus-${versionLaz}-fpc-${versionFPC}-win32.exe`;
      console.log(`downloadLazarus - Downloading ${downloadURL}`);

      let downloadPath_WIN: string;
      try {
        downloadPath_WIN = await tc.downloadTool(downloadURL);
        console.log(`downloadLazarus - Downloaded into ${downloadPath_WIN}`);
      } catch(err) {
        throw err;
      }

      break;
    case 'linux':
      let downloadLazURL: string =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${versionLaz}/lazarus-project_${versionLaz}-0_amd64.deb`;
      let downloadFPCURL: string =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${versionLaz}/fpc-laz_${versionFPC}-1_amd64.deb`;
      let downloadFPCSRCURL: string =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${versionLaz}/fpc-src_{versionFPC}-2_amd64.deb`;
      console.log(`downloadLazarus - Downloading ${downloadLazURL}`);

      let downloadPath_LIN: string;

      try {
        downloadPath_LIN = await tc.downloadTool(downloadLazURL);
        console.log(`downloadLazarus - Downloaded into ${downloadPath_LIN}`);
      } catch(err) {
        throw err;
      }

      let dpkgRes = cp.execSync(`sudo dpkg -i ${downloadPath_LIN}`);
      console.log(`downloadLazarus - Package install result: ${dpkgRes}`);

      break;
    default:
      throw new Error(`downloadLazarus - Platform not implemented yet: ${platform}`);
      break;
  }
}
