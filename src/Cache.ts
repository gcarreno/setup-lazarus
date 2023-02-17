import * as cache from '@actions/cache';
import * as core from '@actions/core';
import { ok } from 'assert';
import * as path from 'path';

export class Cache {
    private _withCache: boolean;
    private _key: string = '';
    private _dir;

    get Key(): string {
        return this._key;
    }

    set Key(Value: string) {
        this._key = Value;
    }

    constructor (WithCache: boolean) {
        let tempDirectory = process.env['RUNNER_TEMP'] || '';
        ok(tempDirectory, 'Expected RUNNER_TEMP to be defined');

        this._withCache = WithCache;
        this._dir = path.join(tempDirectory, 'installers');
    }

    async restore(): Promise<boolean> {
        if (this._withCache === true) {
            core.info(`Cache.restore -- Key: ${this._key} dir: ${this._dir}`);
            let cacheLoaded = await cache.restoreCache([this._dir], this._key) != null;
            if (!cacheLoaded) {
                core.exportVariable('SAVE_CACHE_DIR', this._dir);
                core.exportVariable('SAVE_CACHE_KEY', this._key);
                core.info('Cache.restore -- no hit');
            } else {
                core.info('Cache.restore -- hit');
            }

            return cacheLoaded;
        } else {
            core.info('Cache.restore -- Cache is disabled');
            return false;
        }
    }

    async save(): Promise<void> {
        if (this._withCache === true) {
            try {
                let key = process.env['SAVE_CACHE_KEY'] || '';
                let dir = process.env['SAVE_CACHE_DIR'] || '';

                if (key !='' && dir != '') {
                    core.info(`Cache.save -- Key: ${key} dir: ${dir}`);
                    await cache.saveCache([dir], key);
                } else {
                    core.info('Cache.save -- nothing to save');
                }
            } catch (error) {
                core.info((error as Error).message);
            }
        } else {
            core.info('Cache.save -- Cache is disabled');
        }
    }
}
