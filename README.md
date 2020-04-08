# setup-lazarus

Set up your GitHub Actions workflow with a specific version of Lazarus

## Inputs

### lazarus-version

**Required** Lazarus version. Default `"dist"`.

#### Possible values (**NOTE**: needs complete list and what version of FPC is included)

* "dist" - Lazarus package that comes with the ubuntu dist your chose on `runs-on`
* "2.0.6"
* "2.0.4"
* "2.0.2"


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
