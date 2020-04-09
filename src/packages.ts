export function getPackageName(
  platform: string,
  lazarusVersion: string,
  pkg: string
): string
{
  let result: string = '';

  const pkgs = {
    "win32": {
      "2.0.6": "lazarus-2.0.6-fpc-3.0.4-win32.exe",
      "2.0.4": "lazarus-2.0.4-fpc-3.0.4-win32.exe"
    },
    "linux": {
      "2.0.6": {
        "laz": "lazarus-project_2.0.6-0_amd64.deb",
        "fpc": "fpc-laz_3.0.4-1_amd64.deb",
        "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
      },
      "2.0.4": {
        "laz": "lazarus-project_2.0.4-0_amd64.deb",
        "fpc": "fpc-laz_3.0.4-1_amd64.deb",
        "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
      }
    }
  }

  switch (platform) {
    case "win32":
      result = `https://sourceforge.net/projects/lazarus/files/Lazarus%20Windows%2032%20bits/Lazarus%20${lazarusVersion}/`;
      result += eval(`pkgs.${platform}.${lazarusVersion}`);
      break;
    case "linux":
      result = `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${lazarusVersion}/`;
      result += eval(`pkgs.${platform}.${lazarusVersion}.${pkg}`);
      break;
    default:
      throw new Error(`getPackageName - Platform not implemented yet ${platform}`);
      break;
  }

  return result;
}
