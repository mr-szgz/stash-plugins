# Stash Plugins

This repository publishes a Stash plugin source index for the plugins stored in [`plugins`](./plugins).

- Repository: `https://github.com/mr-szgz/stash-plugins`
- Source index: `https://mr-szgz.github.io/stash-plugins/main/index.yml`

GitHub Actions rebuilds and publishes the source index when changes are pushed to `main` under `plugins/**`.
Plugins marked with `# disabled: true` in their `.yml` manifest are skipped from the published index.

## Available plugin

- **Stash Download Scenes**: An easy method to directly download the stream of any Stash scene.

## Using this source

Add the source index URL below to your Stash plugin sources:

`https://mr-szgz.github.io/stash-plugins/main/index.yml`

## Share your plugins

- [Create a new topic](https://discourse.stashapp.cc/t/-/33) for your plugin on the community forum.
- [Add your source index to the list](https://discourse.stashapp.cc/t/-/122) on the Stash community forum.

## License

This repository currently uses the [AGPL-3.0](./LICENCE) license.
