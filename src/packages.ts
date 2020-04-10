/**
 * function getPackageName
 *
 * returns the full URL of the file to download
 */
export function getPackageName(
  platform: string,
  lazarusVersion: string,
  pkg: string
): string
{
  let result: string = '';

  let pkgs: object = {
    "win32": {
      "v2_0_6" : "lazarus-2.0.6-fpc-3.0.4-win32.exe",
      "v2_0_4" : "lazarus-2.0.4-fpc-3.0.4-win32.exe",
      "v2_0_2" : "lazarus-2.0.2-fpc-3.0.4-win32.exe",
      "v2_0_0" : "lazarus-2.0.0-fpc-3.0.4-win32.exe",
      "v1_8_4" : "lazarus-1.8.4-fpc-3.0.4-win32.exe",
      "v1_8_2" : "lazarus-1.8.2-fpc-3.0.4-win32.exe",
      "v1_8_0" : "lazarus-1.8.0-fpc-3.0.4-win32.exe",
      "v1_6_4" : "lazarus-1.6.4-fpc-3.0.2-win32.exe",
      "v1_6_2" : "lazarus-1.6.2-fpc-3.0.0-win32.exe",
      "v1_6"   : "lazarus-1.6.0-fpc-3.0.0-win32.exe",
      "v1_4_4" : "lazarus-1.4.4-fpc-2.6.4-win32.exe",
      "v1_4_2" : "lazarus-1.4.2-fpc-2.6.4-win32.exe",
      "v1_4"   : "lazarus-1.4.0-fpc-2.6.4-win32.exe",
      "v1_2_6" : "lazarus-1.2.6-fpc-2.6.4-win32.exe",
      "v1_2_4" : "lazarus-1.2.4-fpc-2.6.4-win32.exe",
      "v1_2_2" : "lazarus-1.2.2-fpc-2.6.4-win32.exe",
      "v1_2"   : "lazarus-1.2.0-fpc-2.6.2-win32.exe",
      "v1_0_14": "lazarus-1.0.14-fpc-2.6.2-win32.exe",
      "v1_0_12": "lazarus-1.0.12-fpc-2.6.2-win32.exe"
    },
    "linux": {
      "v2_0_6": {
        "laz": "lazarus-project_2.0.6-0_amd64.deb",
        "fpc": "fpc-laz_3.0.4-1_amd64.deb",
        "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
      },
      "v2_0_4": {
        "laz": "lazarus-project_2.0.4-0_amd64.deb",
        "fpc": "fpc-laz_3.0.4-1_amd64.deb",
        "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
      },
      "v2_0_2": {
        "laz": "lazarus-project_2.0.2-0_amd64.deb",
        "fpc": "fpc-laz_3.0.4-1_amd64.deb",
        "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
      },
      "v2_0_0": {
        "laz": "lazarus-project_2.0.0-0_amd64.deb",
        "fpc": "fpc-laz_3.0.4-1_amd64.deb",
        "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
      },
      "v1_8_4": {
        "laz": "lazarus-project_1.8.4-0_amd64.deb",
        "fpc": "fpc_3.0.4-3_amd64.deb",
        "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
      },
      "v1_8_2": {
        "laz": "lazarus-project_1.8.2-0_amd64.deb",
        "fpc": "fpc_3.0.4-2_amd64.deb",
        "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
      },
      "v1_8_0": {
        "laz": "lazarus-project_1.8.0-1_amd64.deb",
        "fpc": "fpc_3.0.4-2_amd64.deb",
        "fpcsrc": "fpc-src_3.0.4-2_amd64.deb"
      },
      "v1_6_4": {
        "laz": "lazarus-project_1.6.4-0_amd64.deb",
        "fpc": "fpc_3.0.2-170225_amd64.deb",
        "fpcsrc": "fpc-src_3.0.2-170225_amd64.deb"
      },
      "v1_6_2": {
        "laz": "lazarus-project_1.6.2-1_amd64.deb",
        "fpc": "fpc_3.0.0-151205_amd64.deb",
        "fpcsrc": "fpc-src_3.0.0-151205_amd64.deb"
      },
      "v1_6": {
        "laz": "lazarus_1.6-0_amd64.deb",
        "fpc": "fpc_3.0.0-151205_amd64.deb",
        "fpcsrc": "fpc-src_3.0.0-151205_amd64.deb"
      },
      "v1_4_4": {
        "laz": "lazarus_1.4.4-0_amd64.deb",
        "fpc": "fpc_2.6.4-150228_amd64.deb",
        "fpcsrc": "fpc-src_2.6.4-150228_amd64.deb"
      },
      "v1_4_2": {
        "laz": "lazarus_1.4.2-0_amd64.deb",
        "fpc": "fpc_2.6.4-150228_amd64.deb",
        "fpcsrc": "fpc-src_2.6.4-150228_amd64.deb"
      },
      "v1_4": {
        "laz": "lazarus_1.4.0-0_amd64.deb",
        "fpc": "fpc_2.6.4-150228_amd64.deb",
        "fpcsrc": "fpc-src_2.6.4-150228_amd64.deb"
      },
      "v1_2_6": {
        "laz": "lazarus_1.2.6-0_amd64.deb",
        "fpc": "fpc_2.6.4-140420_amd64.deb",
        "fpcsrc": "fpc-src_2.6.4-140420_amd64.deb"
      },
      "v1_2_4": {
        "laz": "lazarus_1.2.4-0_amd64.deb",
        "fpc": "fpc_2.6.4-140420_amd64.deb",
        "fpcsrc": "fpc-src_2.6.4-140420_amd64.deb"
      },
      "v1_2_2": {
        "laz": "lazarus_1.2.2-0_amd64.deb",
        "fpc": "fpc_2.6.4-140420_amd64.deb",
        "fpcsrc": "fpc-src_2.6.4-140420_amd64.deb"
      },
      "v1_2": {
        "laz": "lazarus_1.2.0-0_amd64.deb",
        "fpc": "fpc_2.6.2-0_amd64.deb",
        "fpcsrc": "fpc-src_2.6.2-0_amd64.deb"
      },
      "v1_0_14": {
        "laz": "lazarus_1.0.14-0_amd64.deb",
        "fpc": "fpc_2.6.2-0_amd64.deb",
        "fpcsrc": "fpc-src_2.6.2-0_amd64.deb"
      },
      "v1_0_12": {
        "laz": "lazarus_1.0.12-0_amd64.deb",
        "fpc": "fpc_2.6.2-0_amd64.deb",
        "fpcsrc": "fpc-src_2.6.2-0_amd64.deb"
      }
    }
  };

  // Replace periods with undescores due to JSON borking with periods or dashes
  let lazVer = 'v' + lazarusVersion.replace(/\./gi, '_');
  switch (platform) {
    case "win32":
      result = `https://sourceforge.net/projects/lazarus/files/Lazarus%20Windows%2032%20bits/Lazarus%20${lazarusVersion}/`;
      //eval(`result += pkgs.${platform}.v${lazVer};`);
      result += pkgs[platform][lazVer];
      break;
    case "linux":
      result = `https://sourceforge.net/projects/lazarus/files/Lazarus%20Linux%20amd64%20DEB/Lazarus%20${lazarusVersion}/`;
      //eval(`result += pkgs.${platform}.v${lazVer}.${pkg};`);
      result += pkgs[platform][lazVer][pkg];
      break;
    default:
      throw new Error(`getPackageName - Platform not implemented yet ${platform}`);
      break;
  }

  return result;
}
