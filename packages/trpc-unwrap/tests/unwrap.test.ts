import { expect, test } from "bun:test"

import { TRPCError } from "@trpc/server"
import { unwrapOrThrow } from "trpc-unwrap"

class TaskClosedError extends Error {}

test("throws a TRPCError of the matched code with the domain message and cause", async () => {
  const cause = new TaskClosedError("The task is already closed.")
  const error = await Promise.resolve(cause)
    .then(unwrapOrThrow({ CONFLICT: TaskClosedError }))
    .catch((error: unknown) => error)

  expect(error).toBeInstanceOf(TRPCError)
  expect(error).toMatchObject({ code: "CONFLICT", message: "The task is already closed.", cause })
})

test("uses the code as the message when the domain error has none", async () => {
  const error = await Promise.resolve(new TaskClosedError())
    .then(unwrapOrThrow({ CONFLICT: TaskClosedError }))
    .catch((error: unknown) => error)

  expect(error).toMatchObject({ code: "CONFLICT", message: "CONFLICT" })
})
