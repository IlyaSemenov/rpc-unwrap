# rpc-unwrap Workspace Agent Guide

## Overview

Convert domain errors that operations return as values into oRPC and tRPC errors.

Read the affected package's `README.md` completely before changing its public API, package behavior, supported runtimes, or user documentation.

Read the relevant guide in [development/](development/README.md) before starting:

- [README.md](development/README.md) before running workspace checks.
- [user-documentation.md](development/user-documentation.md) before changing user documentation.

Extend this guide only with stable, non-obvious conventions, architecture, contracts, workflows, and gotchas that most changes need; put those of one topic in a guide in development/, and list the guide in its index and above with the task that needs it.
Do not catalog files or restate information evident from their names and locations.

## Release status

The packages are at version 0.0.0 and have no users; remove this section with the initial release.

- Judge a change only by the contract it produces.
  Do not compare behavior with previous revisions, call changes breaking, or add compatibility paths, migration notes, or deprecations.
- Do not add changesets: the pending initial release covers every change.
- Keep the history to the single commit of the initial release and amend it with every change: do not add commits, split a task into commits, or propose commit messages.
- Code, tests, and user documentation of a change may land in separate steps; they must agree by the initial release.

## Scope

- `packages/orpc-unwrap` and `packages/trpc-unwrap` are the published adapters; [`packages/core`](packages/core/README.md) is the private core that both adapters build from.
- Keep production code in each package's `src/`.
- Name a directory of one concept in the singular, such as `parser/`, and a directory of like items in the plural, such as `rules/`.
- Keep focused module tests beside their source: `foo.test.ts` and `foo.type-test.ts` test `foo.ts`.
- Test each behavior at the lowest level that can check it: a helper directly, a module that combines helpers by its own unit tests.
- Keep a test of how several modules work together beside the module that combines them, or beside the modules it covers until such a module exists.
- Keep a test helper that builds or reads internals beside them in `src/<module>/testing.ts`, so that nothing outside `src/` imports from `src/`.
- Keep integration and package-boundary tests in each adapter's `tests/`, importing the adapter by name: they see only the public API.
- Name runtime tests `*.test.ts` and compile-only type tests `*.type-test.ts`.
- Keep an adapter's `src/index.ts` limited to explicit public exports.
- Export from an adapter's `src/index.ts` every type that the inferred types of public values reference, so that the declarations of a consumer module can name them.
- Treat each adapter's `package.json` exports and supported runtimes as public contracts.

## Design

- Keep each adapter installable without the other adapter or the private core; published JavaScript and declarations must not import either package.
- Implement behavior and types shared by both adapters once in the private core; keep in the adapters only protocol-specific code: error codes and the construction of RPC errors.
- Keep the call-site contract of both adapters the same, except where the protocol APIs differ.
- With every change, look for refactorings that reduce the complexity of the code it touches, such as duplicated logic or a concept spread over several modules.
  Make those that ease the change, and propose the others in the final report, listed apart from its fixes.
- Give a domain rule or contract a function of its own at its first use, such as how a cache key is built or which values an option accepts, so that the next use finds it; give it a module of its own only when several modules use it.
  Do not extract code that only looks alike.
- Before adding a helper, search for an existing one that does the same.

## Refactoring

- When moving or splitting code, move its tests to follow it.

## Documentation

- Keep both adapters' READMEs consistent section by section; preserve differences required by their protocol APIs.
- Write public README and JSDoc text for package users who do not know the implementation.
- When a change makes an existing statement false, fix that statement rather than add an explanation next to it.
- Add JSDoc to every exported declaration and to internal helpers whose contract, inputs, output, or failure behavior is not obvious.
- Add inline comments beside every non-obvious invariant, algorithmic choice, safety constraint, and intentionally limited behavior.
- Update nearby JSDoc and inline comments whenever the documented code changes, and remove comments that no longer apply.
- Do not narrate self-evident syntax or restate what a name already communicates.
- Describe a default only when readers need it to make a decision or avoid surprising behavior.
- Use One Sentence Per Line for connected prose, including JSDoc and code comments: do not wrap a sentence across lines.
- Keep semantically connected explanations as prose paragraphs, and use lists for separate assertions.
- Link a file of another repository by a tag or a commit, such as of the version you checked, never by a branch such as `main`, whose file changes.

## Changesets

- Add changesets as [.changeset/README.md](.changeset/README.md) describes.

## Tests

- Add a `describe` block where the file gives a reason for it: several APIs or behaviors in one file, or a fixture that belongs to some cases but not all.
  Name such a block after what it covers and keep its fixtures inside it.
- Distinguish several same-kind values by role rather than by order.
  When values differ only by order, number them with digits instead of ordinal words.
- Keep tests deterministic so a failure repeats on every run.
  Generate random inputs from an explicit seed and print the seed in failure messages so the failing input can be replayed.

- Test shared behavior once in the private core through its own API; in the adapters, test only protocol-specific behavior and how the adapter wires the core.

## Checks

- Run package checks from that package's directory or use root scripts to check every workspace package.
- Run the `types` script when public types or TypeScript configuration change.
- Run the `test` script when behavior changes.
- Run the `build` script when package exports, declarations, or supported runtimes change.
