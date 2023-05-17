import * as cache from "@actions/cache";
import * as core from "@actions/core";

import { Cache } from './Cache';

async function run(): Promise<void> {

    // `with-cache` input defined in action metadata file
    let withCache = core.getInput('with-cache') == 'true';

    try {
        let installCache = new Cache(withCache);
        await installCache.save();
    } catch (error) {
        core.setFailed((error as Error).message);
    }
}

run();

export default run;
