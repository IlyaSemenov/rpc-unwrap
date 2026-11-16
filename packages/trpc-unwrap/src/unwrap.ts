import { createUnwrap, type ErrorMap, type KnownCodes } from "@rpc-unwrap/core/unwrap"
import { TRPCError } from "@trpc/server"

/** A tRPC error code, such as `NOT_FOUND`. */
export type TrpcErrorCode = ConstructorParameters<typeof TRPCError>[0]["code"]

/**
 * Returns a function for `.then()` that passes a successful result of a domain operation through and throws on an error result.
 *
 * A domain error of `map` becomes a `TRPCError` of its code, with the domain error's message and the domain error as `cause`.
 * Any other error is rethrown as is.
 */
export function unwrapOrThrow<const TMap extends ErrorMap<TrpcErrorCode>>(
  map: TMap & KnownCodes<TMap, TrpcErrorCode>,
) {
  return createUnwrap<TrpcErrorCode, TMap>(
    map,
    // TRPCError falls back to the message of its cause, which is empty here, so name the code as tRPC does without a cause.
    ({ code, message, cause }) => new TRPCError({ code, message: message ?? code, cause }),
  )
}
