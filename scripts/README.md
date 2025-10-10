Usage

This folder contains helper scripts for database maintenance.

Drop UNIQUE index on `username` (if it exists)

1. Ensure `.env` contains `MONGO_URI`.
2. Run:

```bash
node --experimental-modules scripts/drop-username-unique-index.mjs
```

The script will list indexes on the `users` collection and remove a unique index on `username` if present.
