import * as cache from '@actions/cache';
import * as core from '@actions/core';
import { ok } from 'assert';
import * as path from 'path';

export class Cache {
    private _key: string = '';
    private _dir;

    get Key(): string {
        return this._key;
    }

    set Key(Value: string) {
        this._key = Value;
    }

    constructor () {
        let tempDirectory = process.env['RUNNER_TEMP'] || '';
        ok(tempDirectory, 'Expected RUNNER_TEMP to be defined');

        this._dir = path.join(tempDirectory, 'installers');
    }

    async restore(): Promise<boolean> {
        console.log(`Cache.restore -- Key: ${this._key} dir: ${this._dir}`);
        let cacheLoaded = await cache.restoreCache([this._dir], this._key) != null;
        if (!cacheLoaded) {
            core.exportVariable('SAVE_CACHE_DIR', this._dir);
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

            console.log(`Cache.save -- Key: ${key} dir: ${dir}`);
            await cache.saveCache([dir], key);
        } catch (error) {
            console.log(error.message);
        }
    }
}
