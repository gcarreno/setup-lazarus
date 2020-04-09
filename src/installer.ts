import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import {exec} from '@actions/exec/lib/exec';
import * as os from 'os';
import * as path from 'path';
import {ok} from 'assert';

export async function getLazarus(version): Promise<void> {
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

async function downloadLazarus(versionLaz, versionFPC): Promise<void> {
  let platform = os.platform();
  console.log(`downloadLazarus - Installing on platform: ${platform}`);


  switch (platform) {
    case 'win32':
      let downloadURL =
        `https://sourceforge.net/projects/lazarus/files/Lazarus%20Windows%2032%20bits/Lazarus%20${versionLaz}/lazarus-${versionLaz}-fpc-${versionFPC}-win32.exe`;
      console.log(`downloadLazarus - Downloading ${downloadURL}`);

      let downloadPath_WIN: string;
      let execRes: number;
      try {
        downloadPath_WIN = await tc.downloadTool(downloadURL);
        console.log(`downloadLazarus - Downloaded into ${downloadPath_WIN}`);
        /* TODO : Change the extension to .exe and execute the file */
        execRes = await exec(`mv ${downloadPath_WIN} ${downloadPath_WIN}.exe'`);
        console.log(`downloadLazarus - Renaming returned ${execRes}`);
        downloadPath_WIN += '.exe';
        let lazarusDir: string = path.join(_getTempDirectory(), 'lazarus');
        execRes = await exec(`${downloadPath_WIN} /VERYSILENT /DIR=${lazarusDir}`);
        console.log(`downloadLazarus - Install returned ${execRes}`);
        core.addPath(`${lazarusDir}`);
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

function _getTempDirectory(): string {
  const tempDirectory = process.env['RUNNER_TEMP'] || ''
  ok(tempDirectory, 'Expected RUNNER_TEMP to be defined')
  return tempDirectory
}
