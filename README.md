# setup-lazarus

Set up your GitHub Actions workflow with a specific version of Lazarus

How to use

```yaml
steps:
- uses: actions/checkout@v2
- uses: gcarreno/setup-lazarus@v1
  with:
    lazarus-version: 'dist'
- run: lazbuild YourTestProject.lpi
- run: YourTestProject
```
