import * as core from '@actions/core';
import * as laz from './Lazarus';
import * as pkgs from './Packages';

const RepoBaseURL = 'https://packages.lazarus-ide.org';
const ParamJSON = 'packagelist.json';

export class Installer {
    private _Lazarus: laz.Lazarus;
    private _IncludePackages: string[];
    private _Packages: pkgs.Packages;

    constructor(LazarusVerzion: string, PackageList: string[], WithCache: boolean) {
        this._Lazarus = new laz.Lazarus(LazarusVerzion, WithCache);
        this._IncludePackages = PackageList;
        this._Packages = new pkgs.Packages(LazarusVerzion, RepoBaseURL, ParamJSON);
    }

    async install(): Promise<void> {
        core.startGroup('Installing Lazarus');
        await this._Lazarus.installLazarus();
        core.endGroup();

        if (this._IncludePackages.length > 0) {
            core.startGroup('Installing Packages');
            await this._Packages.installPackages(this._IncludePackages);
            core.endGroup();
        }
    }
}
