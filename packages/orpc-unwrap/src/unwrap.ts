import { createUnwrap, type ErrorMap, type KnownCodes } from "@rpc-unwrap/core/unwrap"

type DatalessErrorFactory = (options?: { message?: string; cause?: unknown }) => Error

/** The error codes of an `errors` object whose errors can be created without `data`. */
export type DatalessErrorCode<TErrors> = {
  [TCode in keyof TErrors]: TErrors[TCode] extends DatalessErrorFactory ? TCode : never
}[keyof TErrors] &
  string

/**
 * Returns a function for `.then()` that passes a successful result of a domain operation through and throws on an error result.
 *
 * A domain error of `map` becomes the error of its code from the procedure's `errors`, with the domain error's message and the domain error as `cause`.
 * Any other error is rethrown as is.
 */
export function unwrapOrThrow<TErrors, const TMap extends ErrorMap<DatalessErrorCode<TErrors>>>(
  errors: TErrors,
  map: TMap & KnownCodes<TMap, DatalessErrorCode<TErrors>>,
) {
  return createUnwrap<DatalessErrorCode<TErrors>, TMap>(map, ({ code, message, cause }) =>
    (errors[code] as DatalessErrorFactory)({ message, cause }),
  )
}
