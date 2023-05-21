import * as core from '@actions/core';
import * as http from '@actions/http-client';
import * as tc from '@actions/tool-cache';
import { exec } from '@actions/exec/lib/exec';
import * as os from 'os';
import * as path from 'path';
import { ok } from 'assert';

export class Packages {
    private _Platform: string = os.platform();
    private _LazarusVersion: string;
    private _BaseURL: string;
    private _ParamJSON: string;
    private _Items: PackageData[] = new Array<PackageData>();

    constructor(LazarusVersion, BaseURL, ParamJSON: string) {
        this._LazarusVersion = LazarusVersion;
        this._BaseURL = BaseURL;
        this._ParamJSON = ParamJSON;
    }

    async installPackages(includePackages:string[]) {
        core.info(`Requested Lazarus packages:`);
        core.info(includePackages.join(', '));

        this._Items = await this._getPackageList(`${this._BaseURL}/${this._ParamJSON}`);
        core.info(`installPackages -- Got ${this._Items.length} package items`);

        try {

            let pkgsToInstall: PackageData[] = [];
            let pkgsToInstallStrings: string[] = [];

            for (const sPKG of includePackages) {
                for (const PKG of this._Items) {

                    if (sPKG.trim() == PKG.DisplayName) {

                        const deps = await this._getDependencies(PKG);
                        for (const dep of deps) {
                            pkgsToInstall.push(dep);
                            pkgsToInstallStrings.push(dep.DisplayName);
                        }
                        pkgsToInstall.push(PKG);
                        pkgsToInstallStrings.push(PKG.DisplayName);
                    }
                }
            }

            core.info(`Installing Lazarus packages(with found dependencies):`);
            core.info(pkgsToInstallStrings.join(', '));

            for (const pkg of pkgsToInstall) {

                // Download the package
                const pkgFile = await this._download(pkg.RepositoryFileName);

                // Unzip the package
                const pkgFolder = await this._extract(
                    pkgFile,
                    path.join(this._getTempDirectory(), pkg.RepositoryFileHash));

                core.info(`installPackage -- Unzipped to "${pkgFolder}/${pkg.PackageBaseDir}"`);

                // Clean up, no need for the file to lay around any more
                await exec(`rm ${pkgFile}`);

                for (const fpkg of pkg.Packages) {

                    const pkgLPKFile = path.join(
                        pkgFolder,
                        pkg.PackageBaseDir,
                        fpkg.RelativeFilePath,
                        fpkg.PackageFile
                    );

                    switch (fpkg.PackageType) {
                        case 0:
                        case 1:
                            // Making Lazarus aware of the package
                            if (this._Platform != 'darwin') {
                                core.info(`installPackages -- executing lazbuild --add-package "${pkgLPKFile}"`);
                                await exec('lazbuild --add-package "' + pkgLPKFile + '"');
                            } else {
                                core.info(`installPackages -- executing lazbuild --ws=cocoa --add-package "${pkgLPKFile}"`);
                                await exec('lazbuild --ws=cocoa --add-package "' + pkgLPKFile + '"');
                            }

                            // Compiling the package
                            if (this._Platform != 'darwin') {
                                core.info(`installPackages -- executing lazbuild "${pkgLPKFile}"`);
                                await exec('lazbuild "' + pkgLPKFile + '"');
                            } else {
                                core.info(`installPackages -- executing lazbuild --ws=cocoa "${pkgLPKFile}"`);
                                await exec('lazbuild --ws=cocoa "' + pkgLPKFile + '"');
                            }
                            break;
                        case 2:
                            // Making Lazarus aware of the package
                            if (this._Platform != 'darwin') {
                                core.info(`installPackages -- executing lazbuild --add-package-link "${pkgLPKFile}"`);
                                await exec('lazbuild --add-package-link "' + pkgLPKFile + '"');
                            } else {
                                core.info(`installPackages -- executing lazbuild --ws=cocoa --add-package-link "${pkgLPKFile}"`);
                                await exec('lazbuild --ws=cocoa --add-package-link "' + pkgLPKFile + '"');
                            }
                            // Compiling the package
                            if (this._Platform != 'darwin') {
                                core.info(`installPackages -- executing lazbuild "${pkgLPKFile}"`);
                                await exec('lazbuild "' + pkgLPKFile + '"');
                            } else {
                                core.info(`installPackages -- executing lazbuild --ws=cocoa "${pkgLPKFile}"`);
                                await exec('lazbuild --ws=cocoa "' + pkgLPKFile + '"');
                            }
                            break;
                        default:
                            throw new Error(`installPackage -- PackageType "${fpkg.PackageType}" not implemented`);
                            break;
                    }

                }

            }

        } catch (error) {
            throw error;
        }

    }

    private async _getDependencies(
        Package: PackageData
    ): Promise<PackageData[]> {
        let result: PackageData[] = [];

        for (const file of Package.Packages) {
            const deps = file.DependenciesAsString.split(',');
            for (const dep of deps) {
                for (const pkg of this._Items) {
                    if (Package.Name == pkg.Name) {
                        continue;
                    }
                    if (pkg.containsPackage(dep)) {
                        //console.log(`   Found dependency ${pkg.Name} for ${Package.Name}`);
                        const pdeps = await this._getDependencies(pkg);
                        for (const pdep of pdeps) {
                            result.push(pdep);
                        }
                        result.push(pkg);
                    }
                }
            }
        }

        return result;
    }

    private async _extract(
        file, dest: string
    ): Promise<string> {
        let result = await tc.extractZip(file, dest);
        return result;
    }

    private async _download(
        filename: string
    ): Promise<string> {
        let tempDir = this._getTempDirectory();
        core.info(`_download -- Going to download "${this._BaseURL}/${filename}" to "${tempDir}"`);

        let pkgFilename: string = await tc.downloadTool(`${this._BaseURL}/${filename}`, path.join(this._getTempDirectory(), filename));
        return pkgFilename;
    }

    private async _getPackageList(
        repoURL: string
    ): Promise<PackageData[]> {
        let result = new Array<PackageData>();

        let httpClient: http.HttpClient = new http.HttpClient();
        let httpResponse: http.HttpClientResponse;
        let packageList: any;
        try {
            httpResponse = await httpClient.get(repoURL);
            packageList = JSON.parse(await httpResponse.readBody());
        } catch (error) {
            throw new Error(`getPackageList -- ${(error as Error).message}`);
        }

        let pkgCount = Object.keys(packageList).length / 2;
        //core.info(`_getPackageList -- We have ${pkgCount} packages from repo`);

        for (let dIndex = 0; dIndex < pkgCount; dIndex++) {
            let _pkgData = packageList[`PackageData${dIndex}`];
            let pkgData = new PackageData();

            pkgData.Name = _pkgData['Name'];
            pkgData.DisplayName = _pkgData['DisplayName'];
            pkgData.RepositoryFileName = _pkgData['RepositoryFileName'];
            pkgData.RepositoryFileHash = _pkgData['RepositoryFileHash'];
            pkgData.PackageBaseDir = _pkgData['PackageBaseDir'];

            let _pkgFiles = packageList[`PackageFiles${dIndex}`];
            for (let fIndex = 0; fIndex < _pkgFiles.length; fIndex++) {
                let _pkgFile = _pkgFiles[fIndex];
                let pkgFile = new PackageFile();

                pkgFile.PackageFile = _pkgFile['Name'];
                pkgFile.RelativeFilePath = _pkgFile['RelativeFilePath'];
                pkgFile.LazCompatibility = _pkgFile['LazCompatibility'];
                pkgFile.FPCCompatability = _pkgFile['FPCCompatability'];
                pkgFile.DependenciesAsString = _pkgFile['DependenciesAsString'];
                pkgFile.PackageType = _pkgFile['PackageType'];

                pkgData.Packages.push(pkgFile);
            }

            result.push(pkgData);
        }

        return result;
    }
    private _getTempDirectory(): string {
        const tempDirectory = process.env['RUNNER_TEMP'] || ''
        ok(tempDirectory, 'Expected RUNNER_TEMP to be defined')
        return tempDirectory
     }
}

class PackageData {
    Name: string = '';
    DisplayName = '';
    RepositoryFileName: string = '';
    RepositoryFileHash: string = '';
    private _PackageBaseDir: string = '';
    Packages: PackageFile[] = new Array<PackageFile>();

    get PackageBaseDir(): string {
        return this._PackageBaseDir;
    }
    set PackageBaseDir(value: string) {
        this._PackageBaseDir = value.replace(/\\/gi, '');
    }

    public containsPackage(Needle: String): boolean {
        let name: string = '';
        let version: string = '';

        if (Needle.includes('(')) {
            const parts = Needle.split('(');
            name = parts[0].trim() + '.lpk';
            version = parts[1].trim();
            version = version.substr(0, version.length - 1);
        }
        for (const file of this.Packages) {
            if (file.PackageFile == name) {
                return true;
            }
        }
        return false;
    }
}

class PackageFile {
    PackageFile: string = '';
    private _RelativeFilePath: string = '';
    LazCompatibility: string[] = new Array<string>();
    FPCCompatability: string[] = new Array<string>();
    DependenciesAsString: string = '';
    PackageType: number = -1;

    get RelativeFilePath(): string {
        return this._RelativeFilePath;
    }
    set RelativeFilePath(value: string) {
        this._RelativeFilePath = value.replace(/\\/gi, '');
    }
}
