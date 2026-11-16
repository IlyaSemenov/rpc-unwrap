# trpc-unwrap

Convert domain errors that operations return as values into [tRPC](https://trpc.io/) errors.

## Install

```sh
npm install trpc-unwrap
```

## Usage

Let a domain operation return its expected failures as error values:

```ts
export class InvoiceNotFoundError extends Error {
  override name = "InvoiceNotFoundError" as const

  constructor() {
    super("Invoice not found.")
  }
}

export async function payInvoice(
  id: string,
): Promise<Payment | InvoiceNotFoundError | InvoiceClosedError> {
  // ...
}
```

In the procedure, map each tRPC error code to its domain errors:

```ts
import { unwrapOrThrow } from "trpc-unwrap"
import * as z from "zod"

export const pay = publicProcedure.input(z.object({ id: z.uuid() })).mutation(({ input }) =>
  payInvoice(input.id).then(
    unwrapOrThrow({
      NOT_FOUND: InvoiceNotFoundError,
      CONFLICT: InvoiceClosedError,
    }),
  ),
)
```

The procedure returns the payment.
A domain error of the map becomes a `TRPCError` of its code, with the domain error's message and the domain error as `cause`.
Any other error is rethrown as is and stays in the result type, so a forgotten error shows in the type of the procedure output.

Give each domain error class a member of its own, such as a literal `name`: TypeScript compares classes by their members, so it cannot tell apart error classes without one.

### Map several errors to one code

```ts
unwrapOrThrow({
  UNAUTHORIZED: [UserNotFoundError, InvalidPasswordError],
})
```

When an error class extends another one of the map, put the subclass first: the first matching rule in map order applies.

### Replace the message

When the domain error's text does not fit the procedure, give the rule a message of its own:

```ts
unwrapOrThrow({
  NOT_FOUND: { error: ReactionTargetNotFoundError, message: "Comment not found." },
})
```

When the rule has no message and the domain error's message is empty, the `TRPCError` takes its code as the message.
