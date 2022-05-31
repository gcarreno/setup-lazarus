import * as cache from '@actions/cache';
import * as core from '@actions/core';
import { ok } from 'assert';
import * as path from 'path';

export class Cache {
    private _key: string = '';
    private _installersPath;

    get Key(): string {
        return this._key;
    }

    set Key(Value: string) {
        this._key = Value;
    }

    constructor () {
        let tempDirectory = process.env['RUNNER_TEMP'] || '';
        ok(tempDirectory, 'Expected RUNNER_TEMP to be defined');

        this._installersPath = path.join(tempDirectory, 'installers');
    }

    async restore(): Promise<boolean> {
        let cacheLoaded = await cache.restoreCache([this._installersPath], this._key) != null;
        if (!cacheLoaded) {
            core.exportVariable('SAVE_CACHE_DIR', this._installersPath);
            core.exportVariable('SAVE_CACHE_KEY', this._key);
        }

        return cacheLoaded;
    }

    async save(): Promise<void> {
        try {
            let dir = process.env['SAVE_CACHE_DIR'] || '';
            ok(dir, 'Expected SAVE_CACHE_DIR to be defined');

            let key = process.env['SAVE_CACHE_KEY'] || '';
            ok(key, 'Expected SAVE_CACHE_KEY to be defined');

            await cache.saveCache([dir], key);
        } catch (error) {
            console.log(error.message);
        }
    }
}
