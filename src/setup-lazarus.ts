import * as core from '@actions/core';
import * as github from '@actions/github';
import * as installer from './installer';
import {exec} from '@actions/exec/lib/exec';

async function run(){
  try {
    // `lazarus-version` input defined in action metadata file
    let lazarusVersion = core.getInput('lazarus-version');

    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);

    //let execRes: string;

    /*execRes =*/ await exec('sudo apt update');
    //console.log(`run - Exec result(sudo apt update): ${execRes}`);
    /*execRes =*/ await exec('sudo apt install -y libgtk2.0-dev');
    //console.log(`run - Exec result(sudo apt install -y libgtk2.0-dev): ${execRes}`);

    await installer.getLazarus(lazarusVersion);

  } catch (error) {
    core.setFailed(error.message);
  }
}


run();
