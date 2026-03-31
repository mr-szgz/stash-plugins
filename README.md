# Stash Plugins

This repository publishes Stash plugin source indexes for the plugins stored in [`plugins`](./plugins).

- Repository: `https://github.com/mr-szgz/stash-plugins`
- Stable source index: `https://mr-szgz.github.io/stash-plugins/main/index.yml`
- Dev source index: `https://mr-szgz.github.io/stash-plugins/dev/index.yml`

GitHub Actions rebuilds and publishes both source indexes when changes are pushed to `main` or `dev` under `plugins/**`.
Plugins marked with `# disabled: true` in their `.yml` manifest are skipped from the published index.

## Available plugin

- **Stash Download Scenes**: An easy method to directly download the stream of any Stash scene.

## Using this source

Add one or both source index URLs below to your Stash plugin sources:

- Stable: `https://mr-szgz.github.io/stash-plugins/main/index.yml`
- Dev: `https://mr-szgz.github.io/stash-plugins/dev/index.yml`

## Share your plugins

- [Create a new topic](https://discourse.stashapp.cc/t/-/33) for your plugin on the community forum.
- [Add your source index to the list](https://discourse.stashapp.cc/t/-/122) on the Stash community forum.

## License

This repository currently uses the [AGPL-3.0](./LICENCE) license.
