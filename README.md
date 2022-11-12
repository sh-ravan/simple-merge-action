# Upmerge GitHub Action

This action merges one branch into another.

If the merge is not necessary, it will do nothing.
If the merge fails due to conflicts, it will fail.

## Installation

To enable the action simply create a yml file with the following content:

```yml
name: 'merge'

on:
  push:

jobs:
  nightly-merge:

    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Merge
      uses: 
      with:
        source: 'master'
        target: 'develop'
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Parameters

### `source`

Source branch to merge from

### `target`

Target branch to merge into

### `commit_message`

Commit message (defaults to "🤖 Automatic Merge - `source` -> `target`")

### `github_token`

Environment variable containing the token to use for push.
Using a secret to store this variable value is strongly recommended, since this value will be printed in the logs.
