import * as core from "@actions/core";
import * as lazarus from "./lazarus";
import * as pkgs from "./packages";

const REPO_BASE_URL = "https://packages.lazarus-ide.org";
const PACKAGE_LIST_JSON = "packagelist.json";

export class Installer {
  private lazarus: lazarus.Lazarus;
  private packages: pkgs.Packages;
  private packageList: string[];

  constructor(
    lazarusVersion: string,
    packageList: string[],
    useCache: boolean
  ) {
    this.lazarus = new lazarus.Lazarus(lazarusVersion, useCache);
    this.packageList = packageList;
    this.packages = new pkgs.Packages(
      lazarusVersion,
      REPO_BASE_URL,
      PACKAGE_LIST_JSON
    );
  }

  async install(): Promise<void> {
    try {
      core.info("Starting the installation process.");

      core.startGroup("Installing Lazarus IDE");
      await this.lazarus.installLazarus();
      
      core.endGroup();
      core.info("Lazarus installation completed.");

      if (this.packageList.length > 0) {
        core.startGroup("Installing Additional Packages");
        core.info(`Packages to install: ${this.packageList.join(", ")}`);
        await this.packages.installPackages(this.packageList);
        core.endGroup();
        core.info("Package installation completed.");
      } else {
        core.info("No additional packages specified for installation.");
      }
    } catch (error) {
      core.setFailed(
        `Installation process failed: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
