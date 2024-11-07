# setup-lazarus

![setup-lazarus logo](images/setup-lazarus-logo.png)

[![Actions Status](https://github.com/gcarreno/setup-lazarus/workflows/build/badge.svg)](https://github.com/gcarreno/setup-lazarus/actions)

Set up your GitHub Actions workflow with a specific version of Lazarus

## VERY IMPORTANT NOTICE

> When build for the `Qt5` widgetset, the combination of `stable`/`v3.0` and `ubuntu-latest`/`ubuntu-22.04` is going to fail.
>
> This is due to the fact that `libqt5pas` is outdated and does not support the new code delivered by Lazarus 3.0.
>
> This is a problem related to the Ubuntu distribution's repositories and the version of `libqt5pas` they carry, used by the GitHub runners.
>
> According to the maintainer of said `libqt5pas`, in [this answer](https://forum.lazarus.freepascal.org/index.php/topic,65619.msg500216.html#msg500216), one solution is to have the workflow script download and install a newer version.
>
> The newer version can be obtained here: <https://github.com/davidbannon/libqt5pas/releases>
>
> Thank you for your patience, continued support and please accept my deepest apologies for this inconvenience.

## Inputs

### lazarus-version

**REQUIRED** Lazarus version.

**DEFAULT** dist.

Possible values:

- `dist` - Lazarus package that comes with the Ubuntu dist you chose on `runs-on` and for Windows the latest stable
- `stable` - Installs the latest stable version: 3.6
- `3.6` - comes with `FPC v3.2.2`
- `3.2` - comes with `FPC v3.2.2`
- `3.4` - comes with `FPC v3.2.2`
- `3.0` - comes with `FPC v3.2.2`
- `2.2.6` - comes with `FPC v3.2.2`
- `2.2.4` - comes with `FPC v3.2.2`
- `2.2.2` - comes with `FPC v3.2.2`
- `2.2.0` - comes with `FPC v3.2.2`
- `2.0.12` - comes with `FPC v3.2.0`
- `2.0.10` - comes with `FPC v3.2.0`
- `2.0.8` - comes with `FPC v3.0.4`
- `2.0.6` - comes with `FPC v3.0.4`
- `2.0.4` - comes with `FPC v3.0.4`
- `2.0.2` - comes with `FPC v3.0.4`
- `2.0.0` - comes with `FPC v3.0.4`
- `1.8.4` - comes with `FPC v3.0.4`
- `1.8.2` - comes with `FPC v3.0.4`
- `1.8.0` - comes with `FPC v3.0.4`
- `1.6.4` - comes with `FPC v3.0.2`
- `1.6.2` - comes with `FPC v3.0.0`
- `1.6` - comes with `FPC v3.0.0`
- `1.4.4` - comes with `FPC v2.6.4`
- `1.4.2` - comes with `FPC v2.6.4`
- `1.4` - comes with `FPC v2.6.4`
- `1.2.6` - comes with `FPC v2.6.4`
- `1.2.4` - comes with `FPC v2.6.4`
- `1.2.2` - comes with `FPC v2.6.4`
- `1.2` - comes with `FPC v2.6.2`
- `1.2` - comes with `FPC v2.6.2`
- `1.0.14` - comes with `FPC v2.6.2`
- `1.0.12` - comes with `FPC v2.6.2`

### include-packages

**OPTIONAL** List of packages to install.

You can ask the action to fetch packages and install them after Lazarus is installed.

Format is a string with the packages separated by comma: "Package 1, Package 2, Package 3".

The list of packages can be searched at the [Lazarus IDE repository](https://packages.lazarus-ide.org).

### with-cache

**OPTIONAL** Use cached installer files.

**DEFAULT** true.

This is a boolean input and will use cache if set to `true`.

**NOTE**

> At this moment, there's an issue with the retrieved install executables for Windows.
> I'm trying to get to the bottom of why, but it's going to take some time.
> Caching is now off by default for Windows until I can solve this issue!

## Platforms

At the moment this action only supports:

- Windows (platform=win32, arch=x64)
- Linux (platform=linux, arch=x64)
- macOS (platform=darwin, arch=x64)

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
