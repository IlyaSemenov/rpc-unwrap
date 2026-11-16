# Development

Guides for specific development tasks.

- [User documentation](user-documentation.md): how to write the user documentation.

## Workspace checks

Install dependencies with `bun install` from the repository root, then run the workspace checks:

```sh
bun run build
bun run types
bun run test
```

Run the same scripts from an adapter's directory to check only that adapter; the private core has only `types` and `test`.
