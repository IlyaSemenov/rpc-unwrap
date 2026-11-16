import { expectTypeOf } from "bun:test"

import { os } from "@orpc/server"
import { unwrapOrThrow } from "orpc-unwrap"
import * as z from "zod"

class TaskNotFoundError extends Error {
  readonly tag = "TaskNotFoundError"
}

declare const result: { id: number } | TaskNotFoundError

os.errors({
  NOT_FOUND: {},
  CONFLICT: { data: z.object({ field: z.string() }) },
  GONE: { data: z.object({ field: z.string() }).optional() },
}).handler(({ errors }) => {
  expectTypeOf(unwrapOrThrow(errors, { NOT_FOUND: TaskNotFoundError })(result)).toEqualTypeOf<{
    id: number
  }>()

  // A code whose data is optional can be created without it.
  unwrapOrThrow(errors, { GONE: TaskNotFoundError })

  // @ts-expect-error The procedure does not declare FORBIDDEN.
  unwrapOrThrow(errors, { FORBIDDEN: TaskNotFoundError })

  // @ts-expect-error CONFLICT requires data, which a domain error does not provide.
  unwrapOrThrow(errors, { CONFLICT: TaskNotFoundError })
})
