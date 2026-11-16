/** A class of domain errors that an operation returns as a value. */
export type ErrorClass = abstract new (...args: never[]) => Error

/**
 * Selects the domain errors that become an RPC error of one code.
 *
 * The RPC error takes the domain error's message; the object form replaces it with `message`, for a domain error whose text does not fit the procedure.
 */
export type ErrorRule = ErrorClass | { error: ErrorClass; message: string }

/** Domain error rules of one RPC error code: a single rule or a list of them. */
export type ErrorRules = ErrorRule | readonly ErrorRule[]

/** Maps RPC error codes to the domain errors that become RPC errors of that code. */
export type ErrorMap<TCode extends string> = Partial<Record<TCode, ErrorRules>>

/** Rejects map keys that are not RPC error codes of the adapter or the procedure. */
export type KnownCodes<TMap, TCode extends string> = Record<Exclude<keyof TMap, TCode>, never>

// `InstanceType` resolves the abstract `ErrorClass` itself to `any`, which would empty the result type of a map typed by `ErrorMap`.
type ClassError<TClass> = TClass extends abstract new (...args: never[]) => infer TError
  ? TError
  : never

type RuleError<TRule> = TRule extends { error: infer TClass }
  ? ClassError<TClass>
  : ClassError<TRule>

// Distributes over the members of a rules union, such as an optional list or a rule widened together with a list.
type RulesError<TRules> = TRules extends readonly (infer TRule)[]
  ? RuleError<TRule>
  : RuleError<TRules>

/** The domain errors that an error map converts into RPC errors. */
export type MappedError<TMap> = { [TCode in keyof TMap]-?: RulesError<TMap[TCode]> }[keyof TMap]

/** The code, message, and cause for creating the RPC error of a domain error that matched a map rule. */
export interface ErrorMatch<TCode extends string> {
  code: TCode
  /** The rule's message, or else the domain error's own; `undefined` when the rule has none and the domain message is empty, so that the RPC error keeps the message of its code. */
  message: string | undefined
  /** The domain error, kept for server-side diagnostics. */
  cause: Error
}

/**
 * Returns a function that passes a successful result through and throws on an error result.
 *
 * A domain error of the map becomes the RPC error that `toRpcError` creates; the first matching rule in map order wins.
 * Any other error is rethrown as is; its class stays in the result type, so a forgotten rule shows in the type of the procedure output.
 */
export function createUnwrap<TCode extends string, const TMap extends ErrorMap<TCode>>(
  map: TMap,
  toRpcError: (match: ErrorMatch<TCode>) => Error,
) {
  return <T>(result: T): Exclude<T, MappedError<TMap>> => {
    if (!(result instanceof Error)) {
      return result as Exclude<T, MappedError<TMap>>
    }

    // An optional code of a widened map may hold `undefined`, which has no rules.
    for (const [code, rules] of Object.entries(map) as [TCode, ErrorRules | undefined][]) {
      for (const rule of [rules ?? []].flat()) {
        const { error, message } =
          typeof rule === "function" ? { error: rule, message: undefined } : rule
        if (result instanceof error) {
          throw toRpcError({
            code,
            message: message ?? (result.message || undefined),
            cause: result,
          })
        }
      }
    }

    throw result
  }
}
