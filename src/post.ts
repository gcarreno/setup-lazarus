import * as cache from "@actions/cache";
import * as core from "@actions/core";

import { Cache } from './Cache';

import { _version } from './constants';

async function run(): Promise<void> {
  try {
    let installCache = new Cache();
    await installCache.save();

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

export default run;
