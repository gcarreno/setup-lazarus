import * as tc from '@actions/tool-cache';
import * as os from 'os';
import {exec} from '@actions/exec/lib/exec';

export async function getLazarus(version) {
  console.log(`getLazarus - Installing Lazarus version:  ${version}`);

  //let installDir = tc.find('lazarus', version);
  //console.log(`getLazarus - Tool Cache install dir: ${installDir}`);

  switch (version) {
    case "dist":
      let platform = os.platform();
      switch (platform) {
        case 'linux':
          await exec('sudo apt update');
          await exec('sudo apt install -y lazarus');
          break;
        case 'win32':
          await downloadLazarus('2.0.6', '3.0.4');
          break;
        default:
          throw new Error('getLazarus - Platform not supported: ${platform}');
          break;
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
        /* TODO : Change the extension to .exe and execute the file */
      } catch(err) {
        throw err;
      }

      break;
    case 'linux':
      console.log('downloadLazarus - sudo section');
      await exec('sudo apt update');
      await exec('sudo apt install -y libgtk2.0-dev');

      let downloadLazURL: string =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${versionLaz}/lazarus-project_${versionLaz}-0_amd64.deb`;
      let downloadFPCURL: string =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${versionLaz}/fpc-laz_${versionFPC}-1_amd64.deb`;
      let downloadFPCSRCURL: string =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${versionLaz}/fpc-src_${versionFPC}-2_amd64.deb`;
      console.log(`downloadLazarus - Downloading ${downloadLazURL}`);

      let downloadPath_LIN: string;
      //let dpkgRes: string;

      try {
        console.log(`downloadLazarus - Downloading ${downloadFPCSRCURL}`);
        downloadPath_LIN = await tc.downloadTool(downloadFPCSRCURL);
        console.log(`downloadLazarus - Downloaded into ${downloadPath_LIN}`);
        await exec(`sudo dpkg -i ${downloadPath_LIN}`);
      } catch(err) {
        throw err;
      }

      try {
        console.log(`downloadLazarus - Downloading ${downloadFPCURL}`);
        downloadPath_LIN = await tc.downloadTool(downloadFPCURL);
        console.log(`downloadLazarus - Downloaded into ${downloadPath_LIN}`);
        await exec(`sudo dpkg -i ${downloadPath_LIN}`);
      } catch(err) {
        throw err;
      }

      try {
        console.log(`downloadLazarus - Downloading ${downloadLazURL}`);
        downloadPath_LIN = await tc.downloadTool(downloadLazURL);
        console.log(`downloadLazarus - Downloaded into ${downloadPath_LIN}`);
        await exec(`sudo dpkg -i ${downloadPath_LIN}`);
      } catch(err) {
        throw err;
      }

      break;
    default:
      throw new Error(`downloadLazarus - Platform not implemented yet: ${platform}`);
      break;
  }
}
