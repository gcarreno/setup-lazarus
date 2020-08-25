import * as http from '@actions/http-client';
import * as tc from '@actions/tool-cache';
import {exec} from '@actions/exec/lib/exec';
import * as path from 'path';
import {ok} from 'assert';

export class Packages {
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
        console.log(`Installing Lazarus packages:`);
        console.log(includePackages);

        this._Items = await this._getPackageList(`${this._BaseURL}/${this._ParamJSON}`);
        console.log(`installPackages -- Got ${this._Items.length} package items`);
        
        try {
            for (let index: number = 0; index < includePackages.length; index++) {
                    
                let ipkg: string = includePackages[index];

                for (let _iIndex: number = 0; _iIndex < this._Items.length; _iIndex++) {
                        
                    let pkg: PackageData = this._Items[_iIndex];
                

                    if (ipkg.trim() == pkg.Name) {
                        
                        /*
                         *   At this point I need to implement dependency test and installation
                         * recursively to have this thing complete.
                         *   For the moment I'll to mention that in a proeminent place.
                         */
                        
                         // Download the package
                        let pkgFile = await this._download(pkg.RepositoryFileName);
                        
                        // Unzip the package
                        let pkgFolder = await this._extract(
                            pkgFile, 
                            path.join(this._getTempDirectory(), pkg.RepositoryFileHash)) ;
                        
                        console.log(`installPackage -- Unzipped to ${pkgFolder}/${pkg.PackageBaseDir}`);
                        // Clean up, no need for the file to lay around any more
                        await exec(`rm ${pkgFile}`);

                        for (let fIndex: number = 0; fIndex < pkg.Packages.length; fIndex++) {
                            let fpkg: PackageFile = pkg.Packages[fIndex];

                            let pkgLPKFile = path.join(
                                pkgFolder,
                                pkg.PackageBaseDir,
                                fpkg.RelativeFilePath,
                                fpkg.PackageFile
                            );

                            switch (fpkg.PackageType) {
                                case 0:
                                    // Making Lazarus aware of the package
                                    console.log(`installPackages -- executing lazbuild --add-package ${pkgLPKFile} --skip-dependencies`);
                                    await exec(`lazbuild --add-package ${pkgLPKFile} --skip-dependencies`);

                                    // Compiling the package
                                    console.log(`installPackages -- executing lazbuild ${pkgLPKFile}`);
                                    //await exec(`lazbuild ${pkgLPKFile}`);
                                    break;
                                case 2:
                                case 3:
                                    // Making Lazarus aware of the package
                                    console.log(`installPackages -- executing lazbuild --add-package-link ${pkgLPKFile} --skip-dependencies`);
                                    await exec(`lazbuild --add-package-link ${pkgLPKFile} --skip-dependencies`);

                                    // Compiling the package
                                    console.log(`installPackages -- executing lazbuild ${pkgLPKFile}`);
                                    //await exec(`lazbuild ${pkgLPKFile}`);
                                    break;
                                default:
                                    throw new Error(`installPackage -- PackageType "${fpkg.PackageType}" not implemented`);
                                    break;
                            }

                        }

                    }

                }
            }
            
            console.log(`installPackages -- executing lazbuild --build-all`);
            await exec(`lazbuild --build-all`);
        } catch (error) {
            throw error;
        }

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
        console.log(`_download -- Going to download ${this._BaseURL}/${filename} to ${tempDir}`);
        
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
            throw new Error(`getPackageList -- ${error.message}`);
        }
    
        let pkgCount = Object.keys(packageList).length / 2;
        //console.log(`_getPackageList -- We have ${pkgCount} packages from repo`);
    
        for (let dIndex = 0; dIndex < pkgCount; dIndex++) {
            let _pkgData = packageList[`PackageData${dIndex}`];
            let pkgData = new PackageData();
    
            pkgData.Name = _pkgData['Name'];
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