import * as http from '@actions/http-client';
import * as tc from '@actions/tool-cache';
import {exec} from '@actions/exec/lib/exec';
import * as path from 'path';
import {ok} from 'assert';

export class PackagesLocal {
    private _LazarusVersion: string;

    constructor(LazarusVersion: string) {
        this._LazarusVersion = LazarusVersion;
    }

    async installPackages(packages:string[]) {
        console.log(`Installing Lazarus local packages:`);
        console.log(packages);

        console.log(`installPackages -- Got ${packages.length} local package items to install`);
        
        try {
            let pkgPath = path.join(this._getTempDirectory(), "lazarus", "config");

            for (let index: number = 0; index < packages.length; index++) {
                    
                let ipkg: string = packages[index];

                console.log(`installPackages -- executing lazbuild --add-package "${ipkg}" --skip-dependencies --primary-config-path=${pkgPath}`);
                await exec(`lazbuild --add-package "${ipkg}" --skip-dependencies --primary-config-path=${pkgPath}`);

            }
        } catch (error) {
            throw error;
        }

    }

    private _getTempDirectory(): string {
        const tempDirectory = process.env['RUNNER_TEMP'] || ''
        ok(tempDirectory, 'Expected RUNNER_TEMP to be defined')
        return tempDirectory
     }    
}
