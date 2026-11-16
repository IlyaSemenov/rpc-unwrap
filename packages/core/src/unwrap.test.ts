import { expect, test } from "bun:test"

import { createUnwrap, type ErrorMatch } from "./unwrap"

class NotFoundError extends Error {}
class ClosedError extends Error {}
class ArchivedError extends ClosedError {}
class UnknownError extends Error {}

class RpcError extends Error {
  constructor(readonly match: ErrorMatch<string>) {
    super(match.message)
  }
}

function unwrap(map: Parameters<typeof createUnwrap>[0]) {
  return createUnwrap(map, match => new RpcError(match))
}

function catchRpcError(run: () => unknown) {
  try {
    run()
  } catch (error) {
    if (error instanceof RpcError) {
      return error.match
    }
    throw error
  }
  throw new Error("Expected an RPC error.")
}

test("returns a successful result unchanged", () => {
  const result = { id: 1 }

  expect(unwrap({ NOT_FOUND: NotFoundError })(result)).toBe(result)
})

test("converts a domain error into the RPC error of its code with the domain message", () => {
  const cause = new NotFoundError("Task not found.")

  expect(catchRpcError(() => unwrap({ NOT_FOUND: NotFoundError })(cause))).toEqual({
    code: "NOT_FOUND",
    message: "Task not found.",
    cause,
  })
})

test("matches any class of a rule list", () => {
  const map = { CONFLICT: [NotFoundError, ClosedError] }

  expect(catchRpcError(() => unwrap(map)(new ClosedError())).code).toBe("CONFLICT")
})

test("applies the first matching rule of a list", () => {
  const map = {
    CONFLICT: [
      { error: ArchivedError, message: "Archived." },
      { error: ClosedError, message: "Closed." },
    ],
  }

  expect(catchRpcError(() => unwrap(map)(new ArchivedError())).message).toBe("Archived.")
  expect(catchRpcError(() => unwrap(map)(new ClosedError())).message).toBe("Closed.")
})

test("replaces the domain message with the rule message", () => {
  const map = { NOT_FOUND: { error: NotFoundError, message: "Comment not found." } }

  expect(catchRpcError(() => unwrap(map)(new NotFoundError("Target not found."))).message).toBe(
    "Comment not found.",
  )
})

test("leaves the message undefined when the domain error has none", () => {
  expect(
    catchRpcError(() => unwrap({ NOT_FOUND: NotFoundError })(new NotFoundError())).message,
  ).toBeUndefined()
})

test("applies the first matching rule in map order", () => {
  const map = { CONFLICT: ArchivedError, FORBIDDEN: ClosedError }

  expect(catchRpcError(() => unwrap(map)(new ArchivedError())).code).toBe("CONFLICT")
  expect(catchRpcError(() => unwrap(map)(new ClosedError())).code).toBe("FORBIDDEN")
})

test("skips a code without rules", () => {
  expect(
    catchRpcError(() => unwrap({ NOT_FOUND: undefined, CONFLICT: ClosedError })(new ClosedError()))
      .code,
  ).toBe("CONFLICT")
})

test("rethrows the same error when no rule matches", () => {
  const error = new UnknownError()

  try {
    unwrap({ NOT_FOUND: NotFoundError })(error)
  } catch (thrown) {
    expect(thrown).toBe(error)
    return
  }
  throw new Error("Expected the error to be rethrown.")
})
