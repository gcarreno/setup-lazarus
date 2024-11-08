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
    this.packageData = await this.getPackageList(
      `${this.baseUrl}/${this.jsonParam}`
    );
    core.info(`Fetched ${this.packageData.length} package items.`);

    const pkgsToInstall: PackageData[] = await this.resolveDependencies(
      includePackages
    );

    core.info(
      `Installing packages: ${pkgsToInstall
        .map((pkg) => pkg.displayName)
        .join(", ")}`
    );
    await this.installAllPackages(pkgsToInstall);
  }

  private async resolveDependencies(
    includePackages: string[]
  ): Promise<PackageData[]> {
    const pkgsToInstall: PackageData[] = [];
    const pkgsToInstallNames: Set<string> = new Set();

    for (const requestedPkg of includePackages) {
      const matchedPackages = this.packageData.filter(
        (pkg) => pkg.displayName === requestedPkg.trim()
      );

      for (const pkg of matchedPackages) {
        const deps = await this.getDependencies(pkg);
        deps.forEach((dep) =>
          this.addPackageIfNeeded(dep, pkgsToInstall, pkgsToInstallNames)
        );
        this.addPackageIfNeeded(pkg, pkgsToInstall, pkgsToInstallNames);
      }
    }
    return pkgsToInstall;
  }

  private addPackageIfNeeded(
    pkg: PackageData,
    pkgList: PackageData[],
    pkgNames: Set<string>
  ): void {
    if (!pkgNames.has(pkg.displayName)) {
      pkgList.push(pkg);
      pkgNames.add(pkg.displayName);
    }
  }

  private async getDependencies(
    pkg: PackageData,
    seenPkgs: Set<string> = new Set()
  ): Promise<PackageData[]> {
    if (seenPkgs.has(pkg.name)) return [];
    seenPkgs.add(pkg.name);

    const dependencies: PackageData[] = [];
    for (const file of pkg.packages) {
      const depNames = file.dependenciesStr.split(",").map((dep) => dep.trim());
      for (const depName of depNames) {
        const foundPkgs = this.packageData.filter(
          (p) => p.containsPackage(depName) && p.name !== pkg.name
        );
        for (const foundPkg of foundPkgs) {
          dependencies.push(
            foundPkg,
            ...(await this.getDependencies(foundPkg, seenPkgs))
          );
        }
      }
    }
    return dependencies;
  }

  private async installAllPackages(
    pkgsToInstall: PackageData[]
  ): Promise<void> {
    for (const pkg of pkgsToInstall) {
      try {
        const pkgFile = await this.download(pkg.repositoryFileName);
        const pkgFolder = await this.extract(
          pkgFile,
          path.join(this.getTempDirectory(), pkg.repositoryFileHash)
        );
        core.info(`Unzipped to: "${pkgFolder}/${pkg.baseDir}"`);
        await exec(`rm -rf ${pkgFile}`);
        await this.clearDirectory(pkgFolder);
        await this.installLpkFiles(pkgFolder, pkg);
      } catch (error) {
        core.setFailed(`Installation failed: ${(error as Error).message}`);
        throw error;
      }
    }
  }

  private async installLpkFiles(
    pkgFolder: string,
    pkg: PackageData
  ): Promise<void> {
    for (const pkgFile of pkg.packages) {
      const pkgPath = path.join(
        pkgFolder,
        pkg.baseDir,
        pkgFile.relativeFilePath,
        pkgFile.file
      );
      const buildCommand = `lazbuild ${this.getPlatformFlags()} "${pkgPath}"`;

      core.info(`Adding and compiling package: ${pkgPath}`);
      await exec(
        buildCommand.replace("--add-package", "--add-package-link"),
        [],
        { ignoreReturnCode: true }
      );
      await exec(buildCommand);
    }
  }

  private getPlatformFlags(): string {
    return this.platform === "darwin" ? "--ws=cocoa" : "";
  }

  private async extract(file: string, dest: string): Promise<string> {
    core.info(`Extracting ${file} to ${dest}`);
    return tc.extractZip(file, dest);
  }

  private async download(filename: string): Promise<string> {
    const downloadPath = path.join(this.getTempDirectory(), filename);
    core.info(`Downloading ${this.baseUrl}/${filename} to ${downloadPath}`);
    return tc.downloadTool(`${this.baseUrl}/${filename}`, downloadPath);
  }

  private async clearDirectory(dirPath: string): Promise<void> {
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

  private async getPackageList(repoURL: string): Promise<PackageData[]> {
    core.info(`Fetching package list from ${repoURL}`);
    try {
      const httpClient = new http.HttpClient();
      const response = await httpClient.get(repoURL);
      const responseBody = await response.readBody();
      return this.parsePackageList(JSON.parse(responseBody));
    } catch (error) {
      throw new Error(
        `Failed to get package list: ${(error as Error).message}`
      );
    }
  }

  private parsePackageList(packageList: any): PackageData[] {
    const result: PackageData[] = [];
    Object.entries(packageList).forEach(([key, value]) => {
      if (key.startsWith("PackageData")) {
        const pkgData = new PackageData();
        Object.assign(pkgData, value);
        pkgData.packages = packageList[`PackageFiles${key.slice(-1)}`].map(
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

  private getTempDirectory(): string {
    const tempDir = process.env["RUNNER_TEMP"] || "";
    ok(tempDir, "RUNNER_TEMP environment variable is not defined");
    return tempDir;
  }
}

class PackageData {
  name: string = "";
  displayName: string = "";
  repositoryFileName: string = "";
  repositoryFileHash: string = "";
  private pkgBaseDir: string = "";
  packages: PackageFile[] = [];

  get baseDir(): string {
    return this.pkgBaseDir;
  }

  set baseDir(value: string) {
    this.pkgBaseDir = value.replace(/\\/gi, "");
  }

  public containsPackage(needle: string): boolean {
    const [name] = needle.includes("(") ? needle.split("(") : [needle];
    return this.packages.some((pkg) => pkg.file === `${name.trim()}.lpk`);
  }
}

class PackageFile {
  file: string = "";
  private _relativeFilePath: string = "";
  lazarusCompatibility: string[] = [];
  freePascalCompatibility: string[] = [];
  dependenciesStr: string = "";
  type: number = -1;

  get relativeFilePath(): string {
    return this._relativeFilePath;
  }
  set relativeFilePath(value: string) {
    this._relativeFilePath = value.replace(/\\/gi, "");
  }
}
