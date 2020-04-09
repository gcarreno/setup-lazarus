const pkgs = {
  "win32": {
    "2.0.6": ""
  },
  "linux": {
    "2.0.6": {
      "laz": "lazarus-project_2.0.6-0_amd64.deb",
      "fpc": "fpc-laz_3.0.4-1_amd64.deb",
      "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
    }
  }
}

export function getPackageName(
  platform: string,
  lazarusVersion: string,
  pkg: string
): string
{
  let result: string = '';

  switch (platform) {
    case "win32":
      result = pkgs.win32[lazarusVersion];
      break;
    case "linux":
      result = pkgs.win32[lazarusVersion][pkg];
      break;
    default:
      throw new Error(`getPackageName - Platform not implemented yet ${platform}`);
      break;
  }

  return result;
}
