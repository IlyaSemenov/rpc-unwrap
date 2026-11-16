import { expect, test } from "bun:test"

import { call, isDefinedError, ORPCError, os } from "@orpc/server"
import { unwrapOrThrow } from "orpc-unwrap"

class TaskNotFoundError extends Error {}
class TaskClosedError extends Error {}

const close = os
  .errors({
    NOT_FOUND: {},
    CONFLICT: { message: "The task cannot be changed." },
  })
  .handler(({ errors }) =>
    Promise.resolve(new TaskClosedError("The task is already closed.")).then(
      unwrapOrThrow(errors, {
        NOT_FOUND: TaskNotFoundError,
        CONFLICT: TaskClosedError,
      }),
    ),
  )

test("throws the declared error of the matched code with the domain message and cause", async () => {
  const error = await call(close, undefined).catch((error: unknown) => error)

  expect(error).toBeInstanceOf(ORPCError)
  expect(isDefinedError(error)).toBe(true)
  expect(error).toMatchObject({
    code: "CONFLICT",
    message: "The task is already closed.",
    cause: expect.any(TaskClosedError),
  })
})

test("keeps the declared message when the domain error has none", async () => {
  const procedure = os
    .errors({ CONFLICT: { message: "The task cannot be changed." } })
    .handler(({ errors }) =>
      unwrapOrThrow(errors, { CONFLICT: TaskClosedError })(new TaskClosedError()),
    )

  expect(await call(procedure, undefined).catch((error: unknown) => error)).toMatchObject({
    code: "CONFLICT",
    message: "The task cannot be changed.",
  })
})
