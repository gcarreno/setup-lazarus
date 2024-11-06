import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { ok } from "assert";
import * as path from "path";

export class Cache {
  private withCache: boolean;
  private cacheKey: string = "";
  private cacheDir;

  get key(): string {
    return this.cacheKey;
  }

  set key(value: string) {
    this.cacheKey = value;
  }

  constructor(enableCache: boolean) {
    const tempDir = process.env["RUNNER_TEMP"] || "";
    ok(tempDir, "Expected RUNNER_TEMP to be defined");

    this.withCache = enableCache;
    this.cacheDir = path.join(tempDir, "installers");
  }

  async restore(): Promise<boolean> {
    if (!this.withCache) {
      core.info("Cache.restore -- Cache is disabled");
      return false;
    }

    core.info(
      `Cache.restore -- Attempting to restore with Key: ${this.cacheKey}, Directory: ${this.cacheDir}`
    );
    try {
      const cacheRestored = await cache.restoreCache(
        [this.cacheDir],
        this.cacheKey
      );
      if (cacheRestored) {
        core.info("Cache.restore -- Cache hit, cache restored successfully.");
      } else {
        core.info("Cache.restore -- Cache miss, no cache found.");
        core.exportVariable("SAVE_CACHE_DIR", this.cacheDir);
        core.exportVariable("SAVE_CACHE_KEY", this.cacheKey);
      }
      return cacheRestored !== null;
    } catch (error) {
      core.error(
        `Cache.restore -- Error during cache restoration: ${
          (error as Error).message
        }`
      );
      return false;
    }
  }

  async save(): Promise<void> {
    if (!this.withCache) {
      core.info("Cache.save -- Caching is disabled.");
      return;
    }
    
    const key = process.env["SAVE_CACHE_KEY"] || "";
    const dir = process.env["SAVE_CACHE_DIR"] || "";

    if (key && dir) {
      core.info(
        `Cache.save -- Saving cache with Key: ${key}, Directory: ${dir}`
      );
      try {
        await cache.saveCache([dir], key);
        core.info("Cache.save -- Cache saved successfully.");
      } catch (error) {
        core.warning(
          `Cache.save -- Failed to save cache: ${(error as Error).message}`
        );
      }
    } else {
      core.info(
        "Cache.save -- No cache key or directory specified, skipping cache save."
      );
    }
  }
}
