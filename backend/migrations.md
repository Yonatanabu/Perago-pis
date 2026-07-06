# Migrations Guide

## Commands

```bash
# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Generate a migration from entity changes (replace "name" with migration name)
npm run migration:generate --name=MigrationName
```

## Creating a New Migration File

Manually create a file in `src/migrations/` with the format:

```
<timestamp>-<Description>.ts
```

Example: `1700000000001-AddTestColumn.ts`

Each migration must export a class implementing `MigrationInterface` with `up()` and `down()` methods.

## Notes

- Migration files are written in TypeScript and compiled via `ts-node` at runtime
- The `dist/` folder can be deleted — migrations run directly from `src/` using `typeorm-ts-node-commonjs`
- After reverting a migration, the record is removed from the `migrations` table. To re-run, just run `migration:run` again
- If a migration is recorded in the DB but the actual SQL didn't execute (stale record), delete the row from the `migrations` table and re-run
- `synchronize: false` is set in the config — tables are **never** auto-created. All schema changes must go through migrations
- The closure table for `@Tree('closure-table')` uses columns `id_ancestor` and `id_descendant` (TypeORM default naming)
npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts