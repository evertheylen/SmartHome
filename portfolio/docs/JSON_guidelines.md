# JSON guidelines

## Rule 1: metadata vs data

The fields next to *data* (at the same height of *data*) tell you how to interpret the *data*.

The *type* attribute is the most important metadata. This will also tell you which oter metadata attributes are important.

## Rule 2: No metadata overkill

Please try to limit the amount of metadata and specifically the amount of possible attributes.

## Rule 3: Consistent answers

Answers to message contain (if possible) the same metadata.

## Rules 4/5: Errors?

Requests that are very likely to succeed without errors (unless in some exceptional scenario (for example, the db connection dropped in the backend)), we call the request **nonrisky**. In this case, errors are communicated in their own `"type": "error"`.

There are also **risky** requests, these can fail because the user is dumb (for example, an email address might already be taken or wrong password). In these cases, there is a *status* attribute that is either `success` or `failure`. This may be accompanied by  a *reason* attribute, which contains a small string similar to the *short* attribute of an error.

However, this status/reason should only be used for a small set of predictable errors. It may still happen that something unexpected happens resulting from a risky request, and the server will still send an full-blown error.
