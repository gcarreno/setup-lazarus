import * as core from "@actions/core";
import * as http from "@actions/http-client";
import * as tc from "@actions/tool-cache";
import { exec } from "@actions/exec/lib/exec";
import * as os from "os";
import * as path from "path";
import { ok } from "assert";
import { promises as fs } from "fs";

export class Packages {
  private platform: string = os.platform();
  private baseUrl: string;
  private jsonParam: string;
  private packageData: PackageData[] = [];

  constructor(_lazarusVersion: string, baseUrl: string, jsonParam: string) {
    this.baseUrl = baseUrl;
    this.jsonParam = jsonParam;
  }

  async installPackages(includePackages: string[]): Promise<void> {
    core.info(`Requested Lazarus packages: ${includePackages.join(", ")}`);
    this.packageData = await this._getPackageList(
      `${this.baseUrl}/${this.jsonParam}`
    );
    core.info(`Fetched ${this.packageData.length} package items.`);

    const pkgsToInstall: PackageData[] = await this._resolveDependencies(
      includePackages
    );

    core.info(
      `Installing packages: ${pkgsToInstall
        .map((pkg) => pkg.DisplayName)
        .join(", ")}`
    );
    await this._installAllPackages(pkgsToInstall);
  }

  private async _resolveDependencies(
    includePackages: string[]
  ): Promise<PackageData[]> {
    const pkgsToInstall: PackageData[] = [];
    const pkgsToInstallNames: Set<string> = new Set();

    for (const requestedPkg of includePackages) {
      const matchedPackages = this.packageData.filter(
        (pkg) => pkg.DisplayName === requestedPkg.trim()
      );

      for (const pkg of matchedPackages) {
        const deps = await this._getDependencies(pkg);
        deps.forEach((dep) =>
          this._addPackageIfNeeded(dep, pkgsToInstall, pkgsToInstallNames)
        );
        this._addPackageIfNeeded(pkg, pkgsToInstall, pkgsToInstallNames);
      }
    }
    return pkgsToInstall;
  }

  private _addPackageIfNeeded(
    pkg: PackageData,
    pkgList: PackageData[],
    pkgNames: Set<string>
  ): void {
    if (!pkgNames.has(pkg.DisplayName)) {
      pkgList.push(pkg);
      pkgNames.add(pkg.DisplayName);
    }
  }

  private async _getDependencies(
    pkg: PackageData,
    seenPkgs: Set<string> = new Set()
  ): Promise<PackageData[]> {
    if (seenPkgs.has(pkg.Name)) return [];
    seenPkgs.add(pkg.Name);

    const dependencies: PackageData[] = [];
    for (const file of pkg.packages) {
      const depNames = file.DependenciesAsString.split(",").map((dep) => dep.trim());
      for (const depName of depNames) {
        const foundPkgs = this.packageData.filter(
          (p) => p.containsPackage(depName) && p.Name !== pkg.Name
        );
        for (const foundPkg of foundPkgs) {
          dependencies.push(
            foundPkg,
            ...(await this._getDependencies(foundPkg, seenPkgs))
          );
        }
      }
    }
    return dependencies;
  }

  private async _installAllPackages(
    pkgsToInstall: PackageData[]
  ): Promise<void> {
    for (const pkg of pkgsToInstall) {
      try {
        const pkgFile = await this._download(pkg.RepositoryFileName);
        const pkgFolder = await this._extract(
          pkgFile,
          path.join(this._getTempDirectory(), pkg.RepositoryFileHash)
        );
        core.info(`Unzipped to: "${pkgFolder}/${pkg.PackageBaseDir}"`);
        await exec(`rm -rf ${pkgFile}`);
        await this._clearDirectory(pkgFolder);
        await this._installLpkFiles(pkgFolder, pkg);
      } catch (error) {
        core.setFailed(`Installation failed: ${(error as Error).message}`);
        throw error;
      }
    }
  }

  private async _installLpkFiles(
    pkgFolder: string,
    pkg: PackageData
  ): Promise<void> {
    for (const pkgFile of pkg.packages) {
      const pkgPath = path.join(
        pkgFolder,
        pkg.PackageBaseDir,
        pkgFile.RelativeFilePath,
        pkgFile.Name
      );
      const buildCommand = `lazbuild ${this._getPlatformFlags()} "${pkgPath}"`;

      core.info(`Adding and compiling package: ${pkgPath}`);
      await exec(
        buildCommand.replace("--add-package", "--add-package-link"),
        [],
        { ignoreReturnCode: true }
      );
      await exec(buildCommand);
    }
  }

  private _getPlatformFlags(): string {
    return this.platform === "darwin" ? "--ws=cocoa" : "";
  }

  private async _extract(file: string, dest: string): Promise<string> {
    core.info(`Extracting ${file} to ${dest}`);
    return tc.extractZip(file, dest);
  }

  private async _download(filename: string): Promise<string> {
    const downloadPath = path.join(this._getTempDirectory(), filename);
    core.info(`Downloading ${this.baseUrl}/${filename} to ${downloadPath}`);
    return tc.downloadTool(`${this.baseUrl}/${filename}`, downloadPath);
  }

  private async _clearDirectory(dirPath: string): Promise<void> {
    if (
      await fs
        .access(dirPath)
        .then(() => true)
        .catch(() => false)
    ) {
      const files = await fs.readdir(dirPath);
      await Promise.all(
        files.map((file) => fs.unlink(path.join(dirPath, file)))
      );
    } else {
      await fs.mkdir(dirPath);
    }
  }

  private async _getPackageList(repoURL: string): Promise<PackageData[]> {
    core.info(`_getPackageList: Fetching package list from ${repoURL}`);
    try {
      const httpClient = new http.HttpClient();
      const response = await httpClient.get(repoURL);
      const responseBody = await response.readBody();
      return this._parsePackageList(JSON.parse(responseBody));
    } catch (error) {
      throw new Error(
        `Failed to get package list: ${(error as Error).message}`
      );
    }
  }

  private _parsePackageList(packageList: any): PackageData[] {
    const result: PackageData[] = [];
    Object.entries(packageList).forEach(([key, value]) => {
      if (key.startsWith("PackageData")) {
        const pkgData = new PackageData();
        Object.assign(pkgData, value);
        pkgData.packages = packageList[`PackageFiles${key.slice(11)}`].map(
          (file: any) => {
            const pkgFile = new PackageFile();
            Object.assign(pkgFile, file);
            return pkgFile;
          }
        );
        result.push(pkgData);
      }
    });
    return result;
  }

  private _getTempDirectory(): string {
    const tempDir = process.env["RUNNER_TEMP"] || "";
    ok(tempDir, "RUNNER_TEMP environment variable is not defined");
    return tempDir;
  }
}

class PackageData {
  Name: string = "";
  DisplayName: string = "";
  Category: string = "";
  CommunityDescription: string = "";
  ExternalDependecies: string = "";
  OrphanedPackage: number = 0;
  RepositoryFileName: string = "";
  RepositoryFileSize: number = 0;
  RepositoryFileHash: string = "";
  RepositoryDate: number = 0.0;
  PackageBaseDir: string = "";
  HomePageURL: string = "";
  DownloadURL: string = "";
  SVNURL: string = "";

  packages: PackageFile[] = [];

  public containsPackage(needle: string): boolean {
    const [name] = needle.includes("(") ? needle.split("(") : [needle];
    return this.packages.some((pkg) => pkg.Name === `${name.trim()}.lpk`);
  }
}

class PackageFile {
  Name: string = "";
  Description: string = "";
  Author: string = "";
  License: string = "";
  RelativeFilePath: string = "";
  VersionAsString: string = "";
  LazCompatibility: string = "";
  FPCCompatibility: string = "";
  SupportedWidgetSet: string = "";
  PackageType: number = -1;
  DependenciesAsString: string = "";
}
