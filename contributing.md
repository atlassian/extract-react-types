Contributions to Extract React Types in the form of issues and PRs are welcomed.

## Code of Conduct

Extract React Types adheres to the [Contributor Covenant Code of Conduct](code-of-conduct.md).

## Version management

Keystone uses @noviny's [@changesets/cli](https://github.com/atlassian/changesets) in combination with `bolt` to track package versions and publish packages.
This tool allows each PR to indicate which packages need a version bump along with a changelog snippet.
This information is then collated when performing a release to update package versions and `CHANGELOG.md` files.

### What all contributors need to do

- Make your changes (as per usual)
- Before you make a Pull Request, run the `bolt changeset` command and answer the questions that are asked. It will want to know:
  - which packages you want to publish
  - what version you are releasing them at
  - a message to summarise the changes (this message will be written to the changelog of bumped packages)
- Before you accept the changeset, it will inform you of any other dependent packages within the repo that will also be bumped by this changeset. If this looks fine, agree, and a changeset will be generated in the `.changeset` directory.

Each changeset contains two files; `changes.json`, which contains structured data which indicates the packages which need to be updated, and `changes.md`, which contains a markdown snippet which will be included in the `CHANGELOG.md` files for the updated packages.

Here is what a `changeset.json` looks like:

```
{
  "releases": [
    { "name": "@keystone-alpha/adapter-mongoose", "type": "patch" },
    { "name": "@keystone-alpha/keystone", "type": "minor" }
  ],
  "dependents": []
}
```

You can have multiple changesets in a single PR. This will give you more granular changelogs, and is encouraged.

## Release Guidelines

## Publishing

### How to do a release

> This should only ever be done by a very short list of core contributors

Releasing is a two-step process. The first step updates the packages, and the second step publishes updated packages to npm.

#### Steps to version packages

The first step is `bolt apply-changesets`. This will find all changesets that have been created since the last release, and update the version in package.json as specified in those changesets, flattening out multiple bumps to a single package into a single version update.

The `bolt release` command will release new versions of packages to npm.

The commands to run are:

```sh
git checkout master
git pull
git branch -D temp-release-branch
git checkout -b temp-release-branch
bolt apply-changesets
git add .
git commit -m "Run version-packages"
git push --set-upstream origin temp-release-branch
```

Once you have run this you will need to make a pull request to merge this back into master.

#### Release Process

Once the version changes are merged back in to master, to do a manual release:

```sh
git checkout master
git pull
bolt
bolt release
git push --tags
bolt
```

The `bolt publish-changed` command finds packages where the version listed in the `package.json` is ahead of the version published on npm, and attempts to publish just those packages.

Because of this, we should keep the following in mind:

- Once the `apply-changesets` command has been run, the PR from the `temp-release-branch` should be merged before any other PRs are merged into master, to ensure that no changesets are skipped from being included in a release.
- There is no reason you should ever manually edit the version in the `package.json`

### A quick note on changelogs

The release process will automatically generate and update a `CHANGELOG.md` file, however this does not need to be the only way this file is modified. The changelogs are deliberately static assets so past changelogs can be updated or expanded upon.

In addition, content added above the last released version will automatically be appended to the next release. If your changes do not fit comfortably within the summary of a changelog, we encourage you to add a more detailed account directly into the `CHANGELOG.md`.
