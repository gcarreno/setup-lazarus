import * as core from '@actions/core';
import * as laz from './Lazarus';
import * as pkgsOPM from './PackagesOPM';
import * as pkgsLocal from './PackagesLocal';

const RepoBaseURL = 'https://packages.lazarus-ide.org';
const ParamJSON = 'packagelist.json';

export class Installer {
    private _Lazarus: laz.Lazarus;
    private _strPackagesOPM: string[];
    private _strPackagesLocal: string[];
    private _PackagesOPM: pkgsOPM.PackagesOPM;
    private _PackagesLocal: pkgsLocal.PackagesLocal;

    constructor(LazarusVersion: string, PackageOpmList: string[], PackageLocalList: string[]) {
        this._Lazarus = new laz.Lazarus(LazarusVersion);
        this._strPackagesOPM = PackageOpmList;
        this._strPackagesLocal = PackageLocalList;
        this._PackagesOPM = new pkgsOPM.PackagesOPM(LazarusVersion, RepoBaseURL, ParamJSON);
        this._PackagesLocal = new pkgsLocal.PackagesLocal(LazarusVersion);
    }

    async install(): Promise<void> {
        core.startGroup('Installing Lazarus');
        await this._Lazarus.installLazarus();
        core.endGroup();

        if (this._strPackagesOPM.length > 0) {
            core.startGroup('Installing Packages from OPM');
            await this._PackagesOPM.installPackages(this._strPackagesOPM);
            core.endGroup();
        }

        if (!this._strPackagesLocal) {
            core.startGroup('Installing local Packages');
            await this._PackagesLocal.installPackages(this._strPackagesLocal);
            core.endGroup();
        }
    }
}