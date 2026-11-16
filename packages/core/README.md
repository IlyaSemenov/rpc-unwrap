# Private RPC unwrap core

Shared error maps, matching of domain errors and result types for the public adapters.
This workspace package is private; each adapter's tsdown build includes the shared code and types it imports, so published entrypoints resolve their core imports within their own archive.

- `src/`: the unwrap function behind both adapters, parameterized by the conversion of a matched domain error into the adapter's RPC error.
- `build/`: the adapters' shared tsdown configuration.
