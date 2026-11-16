# rpc-unwrap

Convert domain errors that operations return as values into RPC errors, with one map from error codes to error classes per procedure.

Choose the package for your RPC library:

- [orpc-unwrap](packages/orpc-unwrap/README.md) for [oRPC](https://orpc.dev/): converts into the errors that the procedure declares.
- [trpc-unwrap](packages/trpc-unwrap/README.md) for [tRPC](https://trpc.io/) 11: converts into `TRPCError`.

## Contributing

See [development/](development/README.md) for the workspace checks.
