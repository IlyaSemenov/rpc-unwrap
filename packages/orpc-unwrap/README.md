# orpc-unwrap

Convert domain errors that operations return as values into the errors that an [oRPC](https://orpc.dev/) procedure declares.

## Install

```sh
npm install orpc-unwrap
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

In the procedure, declare the error codes and map each code to its domain errors:

```ts
import { os } from "@orpc/server"
import { unwrapOrThrow } from "orpc-unwrap"
import * as z from "zod"

export const pay = os
  .errors({ NOT_FOUND: {}, CONFLICT: {} })
  .input(z.object({ id: z.uuid() }))
  .handler(({ errors, input }) =>
    payInvoice(input.id).then(
      unwrapOrThrow(errors, {
        NOT_FOUND: InvoiceNotFoundError,
        CONFLICT: InvoiceClosedError,
      }),
    ),
  )
```

The procedure returns the payment.
A domain error of the map becomes the declared error of its code, with the domain error's message and the domain error as `cause`.
Any other error is rethrown as is and stays in the result type, so a forgotten error shows in the type of the procedure output.

Give each domain error class a member of its own, such as a literal `name`: TypeScript compares classes by their members, so it cannot tell apart error classes without one.

Map only codes whose `data` is optional: a domain error does not provide it.

### Map several errors to one code

```ts
unwrapOrThrow(errors, {
  UNAUTHORIZED: [UserNotFoundError, InvalidPasswordError],
})
```

When an error class extends another one of the map, put the subclass first: the first matching rule in map order applies.

### Replace the message

When the domain error's text does not fit the procedure, give the rule a message of its own:

```ts
unwrapOrThrow(errors, {
  NOT_FOUND: { error: ReactionTargetNotFoundError, message: "Comment not found." },
})
```

When the rule has no message and the domain error's message is empty, the oRPC error keeps the message declared for its code.
