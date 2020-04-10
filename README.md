# setup-lazarus

![setup-lazarus logo](images/setup-lazarus-logo.png)

[![Actions Status](https://github.com/gcarreno/setup-lazarus/workflows/build/badge.svg)](https://github.com/gcarreno/setup-lazarus/actions)

Set up your GitHub Actions workflow with a specific version of Lazarus

## Inputs

### lazarus-version

**Required** Lazarus version. Default `"dist"`.

Possible values:

* "dist" - Lazarus package that comes with the ubuntu dist your chose on `runs-on`
* LAZ"2.0.6" FPC"3.0.4"
* LAZ"2.0.4" FPC"3.0.4"
* LAZ"2.0.2" FPC"3.0.4"
* LAZ"2.0.0" FPC"3.0.4"
* LAZ"1.8.4" FPC"3.0.4"
* LAZ"1.8.2" FPC"3.0.4"
* LAZ"1.8.0" FPC"3.0.4"
* LAZ"1.6.4" FPC"3.0.2"
* LAZ"1.6.2" FPC"3.0.0"
* LAZ"1.6" FPC"3.0.0"
* LAZ"1.4.4" FPC"2.6.4"
* LAZ"1.4.2" FPC"2.6.4"
* LAZ"1.4" FPC"2.6.4"
* LAZ"1.2.6" FPC"2.6.4"
* LAZ"1.2.4" FPC"2.6.4"
* LAZ"1.2.2" FPC"2.6.4"
* LAZ"1.2" FPC"2.6.2"
* LAZ"1.2" FPC"2.6.2"
* LAZ"1.0.14" FPC"2.6.2"
* LAZ"1.0.12" FPC"2.6.2"

## Platforms

At the moment this action only supports:

* Windows (win32)
* Linux (linux)

**Note** If someone wants to help get masOS (darwin) running I'll be more than happy!

## Example usage

```yaml
steps:
- uses: actions/checkout@v2
- uses: gcarreno/setup-lazarus@v1
  with:
    lazarus-version: 'dist'
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
        lazarus-versions: [dist, 2.0.6]
    steps:
    - uses: actions/checkout@v2
    - name: Install Lazarus
      uses: gcarreno/setup-lazarus@v1.0.34
      with:
        lazarus-version: ${{ matrix.lazarus-versions }}
    - name: Build the test app
      run: lazbuild "tests/testconsoleapplication.lpi"
    - name: Run the test app
      run: bin/testconsoleapplication "--all" "--format=plain"
```
