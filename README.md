# setup-lazarus

![setup-lazarus logo](images/setup-lazarus-logo.png)

[![Actions Status](https://github.com/gcarreno/setup-lazarus/workflows/build/badge.svg)](https://github.com/gcarreno/setup-lazarus/actions)

Set up your GitHub Actions workflow with a specific version of Lazarus

## Inputs

### lazarus-version

**Required** Lazarus version. Default `dist`.

Possible values:

* `dist` - Lazarus package that comes with the Ubuntu dist your chose on `runs-on` and latest stable for Windows
* `stable` - Installs the latest stable version: 2.0.10
* `2.0.10` - comes with FPC "v3.2.0"
* `2.0.8` - comes with FPC "v3.0.4"
* `2.0.6` - comes with FPC "v3.0.4"
* `2.0.4` - comes with FPC "v3.0.4"
* `2.0.2` - comes with FPC "v3.0.4"
* `2.0.0` - comes with FPC "v3.0.4"
* `1.8.4` - comes with FPC "v3.0.4"
* `1.8.2` - comes with FPC "v3.0.4"
* `1.8.0` - comes with FPC "v3.0.4"
* `1.6.4` - comes with FPC "v3.0.2"
* `1.6.2` - comes with FPC "v3.0.0"
* `1.6` - comes with FPC "v3.0.0"
* `1.4.4` - comes with FPC "v2.6.4"
* `1.4.2` - comes with FPC "v2.6.4"
* `1.4` - comes with FPC "v2.6.4"
* `1.2.6` - comes with FPC "v2.6.4"
* `1.2.4` - comes with FPC "v2.6.4"
* `1.2.2` - comes with FPC "v2.6.4"
* `1.2` - comes with FPC "v2.6.2"
* `1.2` - comes with FPC "v2.6.2"
* `1.0.14` - comes with FPC "v2.6.2"
* `1.0.12` - comes with FPC "v2.6.2"

### include-packages

**OPTIONAL** List of packages to install.

You can ask the action to fetch packages and install them after Lazarus is installed.

Format is a string with the packages separated by comma: "Package 1, Package 2, Package 3".

The list of packages can be searched at the [Lazarus IDE repository](https://packages.lazarus-ide.org).

**IMPORTANT** 

> There is no dependency checks implemented YET.
> You must order your package list in order to satisfy the dendencies yourself.

## Platforms

At the moment this action only supports:

* Windows (win32)
* Linux (linux64)

**Note** If someone wants to help get masOS (darwin) running I'll be more than happy!

## Example usage

```yaml
steps:
- uses: actions/checkout@v2
- uses: gcarreno/setup-lazarus@v2.2.9
  with:
    lazarus-version: "dist"
    include-packages: "Synapse 40.1"
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
        operating-system: [ubuntu-18.04,ubuntu-latest]
        lazarus-versions: [dist, stable, 2.0.10, 2.0.6]
    steps:
    - uses: actions/checkout@v2
    - name: Install Lazarus
      uses: gcarreno/setup-lazarus@v2.2.9
      with:
        lazarus-version: ${{ matrix.lazarus-versions }}
        include-packages: "Synapse 40.1"
    - name: Build the Main Application
      run: lazbuild "src/lazaruswithgithubactions.lpi"
    - name: Build the Unit Tests Application
      run: lazbuild "tests/testconsoleapplication.lpi"
    - name: Run the Unit Tests Application
      run: bin/testconsoleapplication "--all" "--format=plain"
```
