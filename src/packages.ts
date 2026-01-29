import * as core from "@actions/core";
import * as http from "@actions/http-client";
import * as tc from "@actions/tool-cache";
import { exec } from "@actions/exec/lib/exec";
import * as os from "os";
import * as path from "path";
import { ok } from "assert";
import { StableVersion } from "./lazarus";
// import { promises as fs } from "fs";

export class Packages {
  private platform: string = os.platform();
  private baseUrl: string;
  private jsonParam: string;
  private packageData: PackageData[] = [];
  private lazarusVersion: string;

  constructor(_lazarusVersion: string, baseUrl: string, jsonParam: string) {
    this.baseUrl = baseUrl;
    this.jsonParam = jsonParam;
    this.lazarusVersion = _lazarusVersion;
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
        //await exec(`rm -rf ${pkgFile}`);
        //await this._clearDirectory(pkgFolder);
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
    const filesToInstall = this._filterCompatiblePackageFiles(pkg.packages);

    for (const pkgFile of filesToInstall) {
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
    core.info(`_extract: Extracting ${file} to ${dest}`);
    return tc.extractZip(file, dest);
  }

  private async _download(filename: string): Promise<string> {
    const downloadPath = path.join(this._getTempDirectory(), filename);
    core.info(`_download: Downloading ${this.baseUrl}/${filename} to ${downloadPath}`);
    return tc.downloadTool(`${this.baseUrl}/${filename}`, downloadPath);
  }

  // private async _clearDirectory(dirPath: string): Promise<void> {
  //   core.info(`_clearDirectory: Clearing ${dirPath}`);
  //   if (
  //     await fs
  //       .access(dirPath)
  //       .then(() => true)
  //       .catch(() => false)
  //   ) {
  //     const files = await fs.readdir(dirPath);
  //     await Promise.all(
  //       files.map((file) => fs.unlink(path.join(dirPath, file)))
  //     );
  //   } else {
  //     await fs.mkdir(dirPath);
  //   }
  // }

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
        pkgData.PackageBaseDir = pkgData.PackageBaseDir.replace(/\\/gi, "");
        pkgData.packages = packageList[`PackageFiles${key.slice(11)}`].map(
          (file: any) => {
            const pkgFile = new PackageFile();
            Object.assign(pkgFile, file);
            pkgFile.RelativeFilePath = pkgFile.RelativeFilePath.replace(/\\/gi, "");
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

  /**
   * Filter package files based on LazCompatibility against the configured Lazarus version.
   * If the Lazarus version cannot be parsed (e.g. "stable", "dist") or no compatible
   * files are found, this falls back to returning the original list.
   */
  private _filterCompatiblePackageFiles(
    files: PackageFile[]
  ): PackageFile[] {
    const lazVer = this._getLazarusMajorMinor();
    if (!lazVer) {
      core.info(
        "_filterCompatiblePackageFiles: Lazarus version is not numeric, skipping LazCompatibility filtering."
      );
      return files;
    }

    const compatible = files.filter((file) =>
      this._isPackageFileCompatible(file, lazVer.major, lazVer.minor)
    );

    if (compatible.length === 0) {
      core.warning(
        `_filterCompatiblePackageFiles: No LazCompatibility match for Lazarus ${this.lazarusVersion}; installing all package files instead.`
      );
      return files;
    }

    return compatible;
  }

  /**
   * Parse the Lazarus version (e.g. "4.4", "2.2.6") into major/minor components.
   * Resolves "stable" and "dist" to the current stable version for OPM compatibility filtering.
   * Returns null if the version cannot be parsed.
   */
  private _getLazarusMajorMinor():
    | { major: number; minor: number }
    | null {
    const version =
      this.lazarusVersion === "stable" || this.lazarusVersion === "dist"
        ? StableVersion
        : this.lazarusVersion;
    const match = version.match(/^(\d+)\.(\d+)(?:\.\d+)?$/);
    if (!match) {
      return null;
    }

    const major = Number(match[1]);
    const minor = Number(match[2]);

    if (Number.isNaN(major) || Number.isNaN(minor)) {
      return null;
    }

    return { major, minor };
  }

  /**
   * Determine whether a single package file is compatible with the given Lazarus
   * major/minor version based on its LazCompatibility string.
   *
   * LazCompatibility examples:
   *   "Trunk, 4.4.0, 4.2.0, 4.0.0, 3.8.0"
   *   "2.2.x"
   */
  private _isPackageFileCompatible(
    file: PackageFile,
    lazMajor: number,
    lazMinor: number
  ): boolean {
    const compat = (file.LazCompatibility || "").trim();
    if (!compat) {
      // No compatibility information; assume compatible to preserve previous behaviour.
      return true;
    }

    const tokens = compat
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    for (const token of tokens) {
      // Skip trunk-only indicators as this action does not currently support trunk builds.
      if (/^trunk$/i.test(token)) {
        continue;
      }

      // Match patterns like "4.4.0", "4.4", "2.2.x"
      const m = token.match(/^(\d+)\.(\d+)(?:\.(\d+|x))?$/i);
      if (!m) {
        continue;
      }

      const tMajor = Number(m[1]);
      const tMinor = Number(m[2]);

      if (Number.isNaN(tMajor) || Number.isNaN(tMinor)) {
        continue;
      }

      if (tMajor === lazMajor && tMinor === lazMinor) {
        return true;
      }
    }

    return false;
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
