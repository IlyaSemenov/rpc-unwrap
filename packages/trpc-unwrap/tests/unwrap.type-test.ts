import { expectTypeOf } from "bun:test"

import { unwrapOrThrow } from "trpc-unwrap"

class TaskNotFoundError extends Error {
  readonly tag = "TaskNotFoundError"
}

declare const result: { id: number } | TaskNotFoundError

expectTypeOf(unwrapOrThrow({ NOT_FOUND: TaskNotFoundError })(result)).toEqualTypeOf<{
  id: number
}>()

// @ts-expect-error MISSING is not a tRPC error code.
unwrapOrThrow({ MISSING: TaskNotFoundError })
