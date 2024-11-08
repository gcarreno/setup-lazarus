import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { exec } from "@actions/exec/lib/exec";
import * as os from "os";
import * as path from "path";
import { ok } from "assert";
import * as fs from "fs";

import { Cache } from "./cache";

const StableVersion = "3.6";

const pkgs: object = {
  win32: {
    v3_6: "lazarus-3.6-fpc-3.2.2-win32.exe",
    v3_4: "lazarus-3.4-fpc-3.2.2-win32.exe",
    v3_2: "lazarus-3.2-fpc-3.2.2-win32.exe",
    v3_0: "lazarus-3.0-fpc-3.2.2-win32.exe",
    v2_2_6: "lazarus-2.2.6-fpc-3.2.2-win32.exe",
    v2_2_4: "lazarus-2.2.4-fpc-3.2.2-win32.exe",
    v2_2_2: "lazarus-2.2.2-fpc-3.2.2-win32.exe",
    v2_2_0: "lazarus-2.2.0-fpc-3.2.2-win32.exe",
    v2_0_12: "lazarus-2.0.12-fpc-3.2.0-win32.exe",
    v2_0_10: "lazarus-2.0.10-fpc-3.2.0-win32.exe",
    v2_0_8: "lazarus-2.0.8-fpc-3.0.4-win32.exe",
    v2_0_6: "lazarus-2.0.6-fpc-3.0.4-win32.exe",
    v2_0_4: "lazarus-2.0.4-fpc-3.0.4-win32.exe",
    v2_0_2: "lazarus-2.0.2-fpc-3.0.4-win32.exe",
    v2_0_0: "lazarus-2.0.0-fpc-3.0.4-win32.exe",
    v1_8_4: "lazarus-1.8.4-fpc-3.0.4-win32.exe",
    v1_8_2: "lazarus-1.8.2-fpc-3.0.4-win32.exe",
    v1_8_0: "lazarus-1.8.0-fpc-3.0.4-win32.exe",
    v1_6_4: "lazarus-1.6.4-fpc-3.0.2-win32.exe",
    v1_6_2: "lazarus-1.6.2-fpc-3.0.0-win32.exe",
    v1_6: "lazarus-1.6.0-fpc-3.0.0-win32.exe",
    v1_4_4: "lazarus-1.4.4-fpc-2.6.4-win32.exe",
    v1_4_2: "lazarus-1.4.2-fpc-2.6.4-win32.exe",
    v1_4: "lazarus-1.4.0-fpc-2.6.4-win32.exe",
    v1_2_6: "lazarus-1.2.6-fpc-2.6.4-win32.exe",
    v1_2_4: "lazarus-1.2.4-fpc-2.6.4-win32.exe",
    v1_2_2: "lazarus-1.2.2-fpc-2.6.4-win32.exe",
    v1_2: "lazarus-1.2.0-fpc-2.6.2-win32.exe",
    v1_0_14: "lazarus-1.0.14-fpc-2.6.2-win32.exe",
    v1_0_12: "lazarus-1.0.12-fpc-2.6.2-win32.exe",
  },
  win64: {
    v3_6: "lazarus-3.6-fpc-3.2.2-win64.exe",
    v3_4: "lazarus-3.4-fpc-3.2.2-win64.exe",
    v3_2: "lazarus-3.2-fpc-3.2.2-win64.exe",
    v3_0: "lazarus-3.0-fpc-3.2.2-win64.exe",
    v2_2_6: "lazarus-2.2.6-fpc-3.2.2-win64.exe",
    v2_2_4: "lazarus-2.2.4-fpc-3.2.2-win64.exe",
    v2_2_2: "lazarus-2.2.2-fpc-3.2.2-win64.exe",
    v2_2_0: "lazarus-2.2.0-fpc-3.2.2-win64.exe",
    v2_0_12: "lazarus-2.0.12-fpc-3.2.0-win64.exe",
    v2_0_10: "lazarus-2.0.10-fpc-3.2.0-win64.exe",
    v2_0_8: "lazarus-2.0.8-fpc-3.0.4-win64.exe",
    v2_0_6: "lazarus-2.0.6-fpc-3.0.4-win64.exe",
    v2_0_4: "lazarus-2.0.4-fpc-3.0.4-win64.exe",
    v2_0_2: "lazarus-2.0.2-fpc-3.0.4-win64.exe",
    v2_0_0: "lazarus-2.0.0-fpc-3.0.4-win64.exe",
    v1_8_4: "lazarus-1.8.4-fpc-3.0.4-win64.exe",
    v1_8_2: "lazarus-1.8.2-fpc-3.0.4-win64.exe",
    v1_8_0: "lazarus-1.8.0-fpc-3.0.4-win64.exe",
    v1_6_4: "lazarus-1.6.4-fpc-3.0.2-win64.exe",
    v1_6_2: "lazarus-1.6.2-fpc-3.0.0-win64.exe",
    v1_6: "lazarus-1.6.0-fpc-3.0.0-win64.exe",
    v1_4_4: "lazarus-1.4.4-fpc-2.6.4-win64.exe",
    v1_4_2: "lazarus-1.4.2-fpc-2.6.4-win64.exe",
    v1_4: "lazarus-1.4.0-fpc-2.6.4-win64.exe",
    v1_2_6: "lazarus-1.2.6-fpc-2.6.4-win64.exe",
    v1_2_4: "lazarus-1.2.4-fpc-2.6.4-win64.exe",
    v1_2_2: "lazarus-1.2.2-fpc-2.6.4-win64.exe",
    v1_2: "lazarus-1.2.0-fpc-2.6.2-win64.exe",
    v1_0_14: "lazarus-1.0.14-fpc-2.6.2-win64.exe",
    v1_0_12: "lazarus-1.0.12-fpc-2.6.2-win64.exe",
  },
  linux: {
    v3_6: {
      laz: "lazarus-project_3.6.0-0_amd64.deb",
      fpc: "fpc-laz_3.2.2-210709_amd64.deb",
      fpcsrc: "fpc-src_3.2.2-210709_amd64.deb",
    },
    v3_4: {
      laz: "lazarus-project_3.4.0-0_amd64.deb",
      fpc: "fpc-laz_3.2.2-210709_amd64.deb",
      fpcsrc: "fpc-src_3.2.2-210709_amd64.deb",
    },
    v3_2: {
      laz: "lazarus-project_3.2.0-0_amd64.deb",
      fpc: "fpc-laz_3.2.2-210709_amd64.deb",
      fpcsrc: "fpc-src_3.2.2-210709_amd64.deb",
    },
    v3_0: {
      laz: "lazarus-project_3.0.0-0_amd64.deb",
      fpc: "fpc-laz_3.2.2-210709_amd64.deb",
      fpcsrc: "fpc-src_3.2.2-210709_amd64.deb",
    },
    v2_2_6: {
      laz: "lazarus-project_2.2.6-0_amd64.deb",
      fpc: "fpc-laz_3.2.2-210709_amd64.deb",
      fpcsrc: "fpc-src_3.2.2-210709_amd64.deb",
    },
    v2_2_4: {
      laz: "lazarus-project_2.2.4-0_amd64.deb",
      fpc: "fpc-laz_3.2.2-210709_amd64.deb",
      fpcsrc: "fpc-src_3.2.2-210709_amd64.deb",
    },
    v2_2_2: {
      laz: "lazarus-project_2.2.2-0_amd64.deb",
      fpc: "fpc-laz_3.2.2-210709_amd64.deb",
      fpcsrc: "fpc-src_3.2.2-210709_amd64.deb",
    },
    v2_2_0: {
      laz: "lazarus-project_2.2.0-0_amd64.deb",
      fpc: "fpc-laz_3.2.2-210709_amd64.deb",
      fpcsrc: "fpc-src_3.2.2-210709_amd64.deb",
    },
    v2_0_12: {
      laz: "lazarus-project_2.0.12-0_amd64.deb",
      fpc: "fpc-laz_3.2.0-1_amd64.deb",
      fpcsrc: "fpc-src_3.2.0-1_amd64.deb",
    },
    v2_0_10: {
      laz: "lazarus-project_2.0.10-0_amd64.deb",
      fpc: "fpc-laz_3.2.0-1_amd64.deb",
      fpcsrc: "fpc-src_3.2.0-1_amd64.deb",
    },
    v2_0_8: {
      laz: "lazarus-project_2.0.8-0_amd64.deb",
      fpc: "fpc-laz_3.0.4-1_amd64.deb",
      fpcsrc: "fpc-src_3.0.4-2_amd64.deb",
    },
    v2_0_6: {
      laz: "lazarus-project_2.0.6-0_amd64.deb",
      fpc: "fpc-laz_3.0.4-1_amd64.deb",
      fpcsrc: "fpc-src_3.0.4-2_amd64.deb",
    },
    v2_0_4: {
      laz: "lazarus-project_2.0.4-0_amd64.deb",
      fpc: "fpc-laz_3.0.4-1_amd64.deb",
      fpcsrc: "fpc-src_3.0.4-2_amd64.deb",
    },
    v2_0_2: {
      laz: "lazarus-project_2.0.2-0_amd64.deb",
      fpc: "fpc-laz_3.0.4-1_amd64.deb",
      fpcsrc: "fpc-src_3.0.4-2_amd64.deb",
    },
    v2_0_0: {
      laz: "lazarus-project_2.0.0-0_amd64.deb",
      fpc: "fpc-laz_3.0.4-1_amd64.deb",
      fpcsrc: "fpc-src_3.0.4-2_amd64.deb",
    },
    v1_8_4: {
      laz: "lazarus-project_1.8.4-0_amd64.deb",
      fpc: "fpc_3.0.4-3_amd64.deb",
      fpcsrc: "fpc-src_3.0.4-2_amd64.deb",
    },
    v1_8_2: {
      laz: "lazarus-project_1.8.2-0_amd64.deb",
      fpc: "fpc_3.0.4-2_amd64.deb",
      fpcsrc: "fpc-src_3.0.4-2_amd64.deb",
    },
    v1_8_0: {
      laz: "lazarus-project_1.8.0-1_amd64.deb",
      fpc: "fpc_3.0.4-2_amd64.deb",
      fpcsrc: "fpc-src_3.0.4-2_amd64.deb",
    },
    v1_6_4: {
      laz: "lazarus-project_1.6.4-0_amd64.deb",
      fpc: "fpc_3.0.2-170225_amd64.deb",
      fpcsrc: "fpc-src_3.0.2-170225_amd64.deb",
    },
    v1_6_2: {
      laz: "lazarus-project_1.6.2-1_amd64.deb",
      fpc: "fpc_3.0.0-151205_amd64.deb",
      fpcsrc: "fpc-src_3.0.0-151205_amd64.deb",
    },
    v1_6: {
      laz: "lazarus_1.6-0_amd64.deb",
      fpc: "fpc_3.0.0-151205_amd64.deb",
      fpcsrc: "fpc-src_3.0.0-151205_amd64.deb",
    },
    v1_4_4: {
      laz: "lazarus_1.4.4-0_amd64.deb",
      fpc: "fpc_2.6.4-150228_amd64.deb",
      fpcsrc: "fpc-src_2.6.4-150228_amd64.deb",
    },
    v1_4_2: {
      laz: "lazarus_1.4.2-0_amd64.deb",
      fpc: "fpc_2.6.4-150228_amd64.deb",
      fpcsrc: "fpc-src_2.6.4-150228_amd64.deb",
    },
    v1_4: {
      laz: "lazarus_1.4.0-0_amd64.deb",
      fpc: "fpc_2.6.4-150228_amd64.deb",
      fpcsrc: "fpc-src_2.6.4-150228_amd64.deb",
    },
    v1_2_6: {
      laz: "lazarus_1.2.6-0_amd64.deb",
      fpc: "fpc_2.6.4-140420_amd64.deb",
      fpcsrc: "fpc-src_2.6.4-140420_amd64.deb",
    },
    v1_2_4: {
      laz: "lazarus_1.2.4-0_amd64.deb",
      fpc: "fpc_2.6.4-140420_amd64.deb",
      fpcsrc: "fpc-src_2.6.4-140420_amd64.deb",
    },
    v1_2_2: {
      laz: "lazarus_1.2.2-0_amd64.deb",
      fpc: "fpc_2.6.4-140420_amd64.deb",
      fpcsrc: "fpc-src_2.6.4-140420_amd64.deb",
    },
    v1_2: {
      laz: "lazarus_1.2.0-0_amd64.deb",
      fpc: "fpc_2.6.2-0_amd64.deb",
      fpcsrc: "fpc-src_2.6.2-0_amd64.deb",
    },
    v1_0_14: {
      laz: "lazarus_1.0.14-0_amd64.deb",
      fpc: "fpc_2.6.2-0_amd64.deb",
      fpcsrc: "fpc-src_2.6.2-0_amd64.deb",
    },
    v1_0_12: {
      laz: "lazarus_1.0.12-0_amd64.deb",
      fpc: "fpc_2.6.2-0_amd64.deb",
      fpcsrc: "fpc-src_2.6.2-0_amd64.deb",
    },
  },
  darwin: {
    v3_6: {
      laz: "Lazarus-3.6-macosx-x86_64.pkg",
      fpc: "fpc-3.2.2.intelarm64-macosx.dmg",
      fpcsrc: "fpc-src-3.2.2-20210709-macosx.dmg",
    },
    v3_4: {
      laz: "Lazarus-3.4-macosx-x86_64.pkg",
      fpc: "fpc-3.2.2.intelarm64-macosx.dmg",
      fpcsrc: "fpc-src-3.2.2-20210709-macosx.dmg",
    },
    v3_2: {
      laz: "Lazarus-3.2-macosx-x86_64.pkg",
      fpc: "fpc-3.2.2.intelarm64-macosx.dmg",
      fpcsrc: "fpc-src-3.2.2-20210709-macosx.dmg",
    },
    v3_0: {
      laz: "Lazarus-3.0-macosx-x86_64.pkg",
      fpc: "fpc-3.2.2.intelarm64-macosx.dmg",
      fpcsrc: "fpc-src-3.2.2-20210709-macosx.dmg",
    },
    v2_2_6: {
      laz: "Lazarus-2.2.6-0-x86_64-macosx.pkg",
      fpc: "fpc-3.2.2.intelarm64-macosx.dmg",
      fpcsrc: "fpc-src-3.2.2-20210709-macosx.dmg",
    },
    v2_2_4: {
      laz: "Lazarus-2.2.4-0-x86_64-macosx.pkg",
      fpc: "fpc-3.2.2.intelarm64-macosx.dmg",
      fpcsrc: "fpc-src-3.2.2-20210709-macosx.dmg",
    },
    v2_2_2: {
      laz: "Lazarus-2.2.2-0-x86_64-macosx.pkg",
      fpc: "fpc-3.2.2.intelarm64-macosx.dmg",
      fpcsrc: "fpc-src-3.2.2-20210709-macosx.dmg",
    },
    v2_2_0: {
      laz: "Lazarus-2.2.0-0-x86_64-macosx.pkg",
      fpc: "fpc-3.2.2.intelarm64-macosx.dmg",
      fpcsrc: "fpc-src-3.2.2-20210709-macosx.dmg",
    },
    v2_0_12: {
      laz: "Lazarus-2.0.12-x86_64-macosx.pkg",
      fpc: "fpc-3.2.0.intel-macosx.dmg",
      fpcsrc: "fpc-src-3.2.0-2-laz.pkg",
    },
    v2_0_10: {
      laz: "Lazarus-2.0.10-x86_64-macosx.pkg",
      fpc: "fpc-3.2.0.intel-macosx.dmg",
      fpcsrc: "fpc-src-3.2.0-2-laz.pkg",
    },
    v2_0_8: {
      laz: "LazarusIDE-2.0.8-macos-x86_64.pkg",
      fpc: "fpc-3.0.4-macos-x86_64-laz-2.pkg",
      fpcsrc: "fpc-src-3.0.4-laz.pkg",
    },
  },
};

export class Lazarus {
  private _Platform: string = os.platform();
  private _Arch: string = os.arch();
  private _LazarusVersion: string = "";
  private _Cache: Cache;

  constructor(LazarusVersion: string, WithCache: boolean) {
    this._LazarusVersion = LazarusVersion;
    this._Cache = new Cache(WithCache);
    this._Cache.key =
      this._LazarusVersion + "-" + this._Arch + "-" + this._Platform;
  }

  async installLazarus(): Promise<void> {
    core.info(
      `installLazarus -- Installing Lazarus ${this._LazarusVersion} on platform: "${this._Platform}"; arch: "${this._Arch}"`
    );

    const installLazarusFromDownload = async (version: string) => {
      this._Cache.key = `${version}-${this._Arch}-${this._Platform}`;
      await this._downloadLazarus();
    };

    const installFromRepo = async (command: string) => {
      await exec("sudo apt update");
      await exec(command);
    };

    switch (this._Platform) {
      case "linux":
        if (this._LazarusVersion === "dist") {
          await installFromRepo("sudo apt install -y lazarus");
        } else {
          await installLazarusFromDownload(this._LazarusVersion);
        }
        break;

      case "darwin":
        if (this._LazarusVersion === "dist") {
          await exec("brew update");
          await exec("brew install lazarus");
          await this._updateLazbuildSymlink();
        } else {
          await installLazarusFromDownload(this._LazarusVersion);
        }
        break;

      case "win32":
        if (this._LazarusVersion === "dist") {
          await installLazarusFromDownload(StableVersion);
        } else {
          await installLazarusFromDownload(this._LazarusVersion);
        }
        break;

      default:
        throw new Error(
          `installLazarus - Platform not supported: ${this._Platform}`
        );
    }
  }

  private async _downloadLazarus(): Promise<void> {
    const cacheRestored =
      this._Platform !== "win32" && (await this._Cache.restore());

    const downloads = [
      { key: "fpcsrc", path: this._getDownloadPath("fpcsrc") },
      { key: "fpc", path: this._getDownloadPath("fpc") },
      { key: "laz", path: this._getDownloadPath("laz") },
    ];

    try {
      if (this._Platform === "win32") {
        await this._downloadAndInstallWindows(cacheRestored, downloads);
      } else if (this._Platform === "linux") {
        await this._downloadAndInstallLinux(cacheRestored, downloads);
      } else if (this._Platform === "darwin") {
        await this._downloadAndInstallMacOS(cacheRestored, downloads);
      } else {
        throw new Error(
          `_downloadLazarus - Platform not implemented: ${this._Platform}`
        );
      }
    } catch (error) {
      throw error as Error;
    }
  }

  private _getDownloadPath(packageName: string): string {
    return path.join(
      this._getTempDirectory(),
      `${packageName}.${this._getFileExtension()}`
    );
  }

  private _getFileExtension(): string {
    return this._Platform === "win32"
      ? "exe"
      : this._Platform === "darwin"
      ? "dmg"
      : "deb";
  }

  private async _downloadAndInstallWindows(
    cacheRestored: boolean,
    downloads: { key: string; path: string }[]
  ): Promise<void> {
    const downloadPath = downloads.find((d) => d.key === "laz")!.path;
    const url = this._getPackageURL("laz");

    core.info(`_downloadLazarus - Downloading ${url}`);
    await this._downloadWithCache(url, downloadPath, cacheRestored);
    await this._runWindowsInstaller(downloadPath);
  }

  private async _downloadAndInstallLinux(
    cacheRestored: boolean,
    downloads: { key: string; path: string }[]
  ): Promise<void> {
    await exec("sudo apt update");
    for (const download of downloads) {
      const url = this._getPackageURL(download.key);
      core.info(`_downloadLazarus - Downloading ${url}`);
      await this._downloadWithCache(url, download.path, cacheRestored);
      await exec(`sudo apt install -y ${download.path}`);
    }
  }

  private async _downloadAndInstallMacOS(
    cacheRestored: boolean,
    downloads: { key: string; path: string }[]
  ): Promise<void> {
    for (const download of downloads) {
      const url = this._getPackageURL(download.key);
      core.info(`_downloadLazarus - Downloading ${url}`);
      await this._downloadWithCache(url, download.path, cacheRestored);
      await this._installMacOSPackage(download.path);
    }
    await this._updateLazbuildSymlink();
  }

  private async _downloadWithCache(
    url: string,
    filePath: string,
    cacheRestored: boolean
  ): Promise<void> {
    if (cacheRestored) {
      core.info(`_downloadLazarus - Using cache restored into ${filePath}`);
    } else {
      await tc.downloadTool(url, filePath);
      core.info(`_downloadLazarus - Downloaded into ${filePath}`);
    }
  }

  private async _runWindowsInstaller(downloadPath: string): Promise<void> {
    const installDir = path.join(this._getTempDirectory(), "lazarus");
    await exec(`${downloadPath} /VERYSILENT /SP- /DIR=${installDir}`);
    core.addPath(installDir);
    // core.info(`_downloadLazarus - Adding '${installDir}' to PATH`);
  }

  private async _installMacOSPackage(downloadPath: string): Promise<void> {
    if (downloadPath.endsWith(".dmg")) {
      await exec(`sudo hdiutil attach ${downloadPath}`);
      const packagePath = await this._findMountedPackage("/Volumes", "fpcsrc");
      await exec(`sudo installer -package ${packagePath} -target /`);
    } else {
      await exec(`sudo installer -package ${downloadPath} -target /`);
    }
  }

  private async _findMountedPackage(
    volumeRoot: string,
    packagePrefix: string
  ): Promise<string> {
    const mountedVolumes = fs
      .readdirSync(volumeRoot)
      .filter((fn) => fn.startsWith(packagePrefix));
    if (!mountedVolumes.length)
      throw new Error(`No mounted volumes found for ${packagePrefix}`);
    const packageFiles = fs
      .readdirSync(path.join(volumeRoot, mountedVolumes[0]))
      .filter((fn) => fn.endsWith(".pkg") || fn.endsWith(".mpkg"));
    if (!packageFiles.length)
      throw new Error(
        `No installer files found in mounted volume for ${packagePrefix}`
      );
    return path.join(volumeRoot, mountedVolumes[0], packageFiles[0]);
  }

  private async _updateLazbuildSymlink(): Promise<void> {
    const lazLibPath = "/Library/Lazarus/lazbuild";
    const lazAppPath = "/Applications/Lazarus/lazbuild";
    if (fs.existsSync(lazLibPath)) {
      core.info(`_downloadLazarus - Do not need to update lazbuild symlink`);
    } else if (fs.existsSync(lazAppPath)) {
      await exec(`rm -rf /usr/local/bin/lazbuild`);
      await exec(`ln -s ${lazAppPath} /usr/local/bin/lazbuild`);
      core.info(`_downloadLazarus - Updated lazbuild symlink`);
    } else {
      throw new Error(
        `Could not find lazbuild in ${lazLibPath} or ${lazAppPath}`
      );
    }
  }

  private _getPackageURL(pkg: string): string {
    // Replace periods with underscores for JSON compatibility
    const lazVer = "v" + this._LazarusVersion.replace(/\./g, "_");

    // Define base URL for each platform
    let baseURL: string = this.getBaseURLForPlatform(lazVer);

    // Append the specific package for the selected platform
    let result = baseURL + pkgs[this._Platform][lazVer][pkg];

    return result;
  }

  // Helper function to get the base URL for each platform
  private getBaseURLForPlatform(lazVer: string = this._LazarusVersion): string {
    switch (this._Platform) {
      case "win32":
        return this.getWinBaseURL(lazVer);
      case "linux":
        return `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${lazVer}/`;
      case "darwin":
        return `https://sourceforge.net/projects/lazarus/files/Lazarus%20macOS%20x86-64/Lazarus%20${lazVer}/`;
      default:
        throw new Error(
          `getPackageName - Platform not implemented yet: ${this._Platform}`
        );
    }
  }

  // Helper function to handle Windows-specific URLs
  private getWinBaseURL(lazVer: string = this._LazarusVersion): string {
    if (this._Arch === "x64") {
      return `https://sourceforge.net/projects/lazarus/files/Lazarus%20Windows%2064%20bits/Lazarus%20${lazVer}/`;
    } else {
      return `https://sourceforge.net/projects/lazarus/files/Lazarus%20Windows%2032%20bits/Lazarus%20${lazVer}/`;
    }
  }

  private _getTempDirectory(): string {
    let tempDirectory = process.env["RUNNER_TEMP"] || "";
    ok(tempDirectory, "Expected RUNNER_TEMP to be defined");
    tempDirectory = path.join(tempDirectory, "installers");
    return tempDirectory;
  }
}
