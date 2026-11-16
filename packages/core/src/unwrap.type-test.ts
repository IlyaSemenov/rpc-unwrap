import { expectTypeOf } from "bun:test"

import { createUnwrap, type ErrorMap } from "./unwrap"

class NotFoundError extends Error {
  readonly tag = "NotFoundError"
}
class ClosedError extends Error {
  readonly tag = "ClosedError"
}
class UnknownError extends Error {
  readonly tag = "UnknownError"
}

declare const result: { id: number } | NotFoundError | ClosedError | UnknownError

const toRpcError = () => new Error()

// Mapped errors leave the result type, other errors stay in it.
expectTypeOf(
  createUnwrap(
    {
      NOT_FOUND: NotFoundError,
      CONFLICT: [{ error: ClosedError, message: "Closed." }],
    },
    toRpcError,
  )(result),
).toEqualTypeOf<{ id: number } | UnknownError>()

expectTypeOf(
  createUnwrap({ CONFLICT: [NotFoundError, ClosedError, UnknownError] }, toRpcError)(result),
).toEqualTypeOf<{
  id: number
}>()

// A rule widened together with a list, and an optional list, cover the classes of every member.
declare const widenedMap: { NOT_FOUND: typeof NotFoundError | readonly [typeof ClosedError] }
expectTypeOf(createUnwrap(widenedMap, toRpcError)(result)).toEqualTypeOf<
  { id: number } | UnknownError
>()

declare const optionalListMap: { NOT_FOUND?: readonly [typeof ClosedError] }
expectTypeOf(createUnwrap(optionalListMap, toRpcError)(result)).toEqualTypeOf<
  { id: number } | NotFoundError | UnknownError
>()

// @ts-expect-error A rule takes an error class.
createUnwrap({ NOT_FOUND: Date }, toRpcError)

// A map typed by `ErrorMap` covers every error class.
declare const map: ErrorMap<"NOT_FOUND">
expectTypeOf(createUnwrap(map, toRpcError)(result)).toEqualTypeOf<{ id: number }>()
