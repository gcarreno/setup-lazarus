# setup-lazarus

![setup-lazarus logo](images/setup-lazarus-logo.png)

[![Actions Status](https://github.com/gcarreno/setup-lazarus/workflows/build/badge.svg)](https://github.com/gcarreno/setup-lazarus/actions)

Set up your GitHub Actions workflow with a specific version of Lazarus

> [!IMPORTANT]
> I'm no longer [able, or willing](https://forum.lazarus.freepascal.org/index.php/topic,59533.msg560789.html#msg560789) to continue updating this action.
> I've asked on of the most prominent users of this action if he could take over, and [his reply](https://forum.lazarus.freepascal.org/index.php/topic,59533.msg561085.html#msg561085) was that he also does not have the time for it.
> I'm now extending the [ask for help](https://forum.lazarus.freepascal.org/index.php/topic,59533.msg561088.html#msg561088) to anyone that's willing to continue maintaining this action.
>
> I'll be eternally grateful to the person that does so!!

> [!IMPORTANT]
> When building with the `Qt5` widgetset, using the combination of `stable` or
> `v3.0` with `ubuntu-latest` or `ubuntu-22.04` may fail. This issue is due to an
> outdated `libqt5pas` library that doesn't support Lazarus 3.0 updates. A
> solution is to download a newer version of `libqt5pas` from the link below:
> <https://github.com/davidbannon/libqt5pas/releases>.

We apologize for the inconvenience and appreciate your patience.

## Inputs

### lazarus-version (required, default: 'dist')

Possible values:

| Lazarus Version | FPC Version | Description   |
| --------------- | ----------- | ------------- |
| dist            |             | Latest stable |
| stable          |             | Lazarus 3.6   |
| 3.6             | 3.2.2       |               |
| 3.4             | 3.2.2       |               |
| 3.2             | 3.2.2       |               |
| 3.0             | 3.2.2       |               |
| 2.2.6           | 3.2.2       |               |
| 2.2.4           | 3.2.2       |               |
| 2.2.2           | 3.2.2       |               |
| 2.2.0           | 3.2.2       |               |
| 2.0.12          | 3.2.0       |               |
| 2.0.10          | 3.2.0       |               |
| 2.0.8           | 3.0.4       |               |
| 2.0.6           | 3.0.4       |               |
| 2.0.4           | 3.0.4       |               |
| 2.0.2           | 3.0.4       |               |
| 2.0.0           | 3.0.4       |               |
| 1.8.4           | 3.0.4       |               |
| 1.8.2           | 3.0.4       |               |
| 1.8.0           | 3.0.4       |               |
| 1.6.4           | 3.0.2       |               |
| 1.6.2           | 3.0.0       |               |
| 1.6             | 3.0.0       |               |
| 1.4.4           | 2.6.4       |               |
| 1.4.2           | 2.6.4       |               |
| 1.4             | 2.6.4       |               |
| 1.2.6           | 2.6.4       |               |
| 1.2.4           | 2.6.4       |               |
| 1.2.2           | 2.6.4       |               |
| 1.2             | 2.6.2       |               |
| 1.2             | 2.6.2       |               |
| 1.0.14          | 2.6.2       |               |
| 1.0.12          | 2.6.2       |               |

> [!NOTE]
> 'dist' is the Lazarus package that comes with the Ubuntu dist you
> chose on `runs-on`, while for Windows it's the latest stable (3.6).

### include-packages

List of packages to install. You can ask the action to fetch packages and
install them after Lazarus is installed. Format is a string with the packages
separated by comma: "Package 1, Package 2, Package 3". The list of packages can
be searched at the [Lazarus IDE repository](https://packages.lazarus-ide.org).

### with-cache (default: false)

Use cached installer files.

This is a boolean input and will use cache if set to `true`.

> [!NOTE]
> At this moment, there's an issue with the retrieved install executables for Windows.
> I'm trying to get to the bottom of why, but it's going to take some time.
> Caching is now off by default for Windows until I can solve this issue!

## Platforms

At the moment this action only supports:

- Windows (win32-x64)
- Linux (linux-x64)
- macOS (darwin-x64)

### IMPORTANT

Due to the hard work of [Levi](https://github.com/leviable) there is now support for macOS.

Unfortunately there are some restrictions:

- The GitHub macOS runners only support Lazarus versions 2.0.8 and up.
- Until further notice only Cocoa widgset is supported on macOS runners.

## Example usage

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: gcarreno/setup-lazarus@v3
    with:
      lazarus-version: "stable"
      include-packages: "Synapse 40.1"
      with-cache: true
  - run: lazbuild YourTestProject.lpi
  - run: YourTestProject
```

## Matrix example usage

```yaml
name: build

on:
  pull_request:
  push:
    paths-ignore:
      - "README.md"
    branches:
      - master
      - releases/*

jobs:
  build:
    runs-on: ${{ matrix.operating-system }}
    strategy:
      matrix:
        operating-system: [windows-latest, ubuntu-latest, macos-latest]
        lazarus-versions: [dist, stable, 2.2.0, 2.0.12, 2.0.10, 2.0.8, 2.0.6]
    steps:
      - name: Checkout source code
        uses: actions/checkout@v4
      - name: Install Lazarus
        uses: gcarreno/setup-lazarus@v3
        with:
          lazarus-version: ${{ matrix.lazarus-versions }}
          include-packages: "Synapse 40.1"
          with-cache: true
      - name: Build the Main Application
        if: ${{ matrix.operating-system != 'macos-latest' }}
        run: lazbuild -B "src/lazaruswithgithubactions.lpi"
      - name: Build the Main Application (macOS)
        if: ${{ matrix.operating-system == 'macos-latest' }}
        run: lazbuild -B --ws=cocoa "src/lazaruswithgithubactions.lpi"
      - name: Build the Unit Tests Application
        run: lazbuild -B "tests/testconsoleapplication.lpi"
      - name: Run the Unit Tests Application
        run: bin/testconsoleapplication "--all" "--format=plain"
```
