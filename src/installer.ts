import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import {exec} from '@actions/exec/lib/exec';
import * as os from 'os';
import * as path from 'path';
import {ok} from 'assert';
import * as pkg from  './packages';

export async function getLazarus(
  version: string
): Promise<void> {
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
          await downloadLazarus('2.0.6');
          break;
        default:
          throw new Error('getLazarus - Platform not supported: ${platform}');
          break;
      }
      break;
    case '2.0.6':
      await downloadLazarus(version);
      break;
    case '2.0.4':
      await downloadLazarus(version);
      break;
    default:
      throw new Error(`getLazarus - Version not supported: ${version}`);
      break;
  }
}

async function downloadLazarus(
  versionLaz: string
): Promise<void> {
  let platform = os.platform();
  console.log(`downloadLazarus - Installing on platform: ${platform}`);


  switch (platform) {
    case 'win32':
      let downloadURL: string = pkg.getPackageName(platform, versionLaz, 'laz');
      console.log(`downloadLazarus - Downloading ${downloadURL}`);

      let downloadPath_WIN: string;
      try {
        downloadPath_WIN = await tc.downloadTool(downloadURL);
        console.log(`downloadLazarus - Downloaded into ${downloadPath_WIN}`);
        /* TODO : Change the extension to .exe and execute the file */
        await exec(`mv ${downloadPath_WIN} ${downloadPath_WIN}.exe'`);
        downloadPath_WIN += '.exe';
        let lazarusDir: string = path.join(_getTempDirectory(), 'lazarus');
        await exec(`${downloadPath_WIN} /VERYSILENT /DIR=${lazarusDir}`);
        core.addPath(`${lazarusDir}`);
      } catch(err) {
        throw err;
      }

      break;
    case 'linux':
      console.log('downloadLazarus - sudo section');
      await exec('sudo apt update');
      await exec('sudo apt install -y libgtk2.0-dev');

      let downloadPath_LIN: string;

      let downloadFPCSRCURL: string = pkg.getPackageName(platform, versionLaz, 'fpcsrc');
      console.log(`downloadLazarus - Downloading ${downloadFPCSRCURL}`);
      try {
        console.log(`downloadLazarus - Downloading ${downloadFPCSRCURL}`);
        downloadPath_LIN = await tc.downloadTool(downloadFPCSRCURL);
        console.log(`downloadLazarus - Downloaded into ${downloadPath_LIN}`);
        await exec(`sudo dpkg -i ${downloadPath_LIN}`);
      } catch(err) {
        throw err;
      }

      let downloadFPCURL: string = pkg.getPackageName(platform, versionLaz, 'fpc');
      console.log(`downloadLazarus - Downloading ${downloadFPCURL}`);
      try {
        console.log(`downloadLazarus - Downloading ${downloadFPCURL}`);
        downloadPath_LIN = await tc.downloadTool(downloadFPCURL);
        console.log(`downloadLazarus - Downloaded into ${downloadPath_LIN}`);
        await exec(`sudo dpkg -i ${downloadPath_LIN}`);
      } catch(err) {
        throw err;
      }

      let downloadLazURL: string = pkg.getPackageName(platform, versionLaz, 'laz');
      console.log(`downloadLazarus - Downloading ${downloadLazURL}`);
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
