type PgError = { code?: string; constraint?: string; cause?: PgError };

// The unique constraint a failed write hit, if any. Drizzle's query builder wraps the Postgres
// error in `cause`; a raw statement in db.batch throws it as is.
export function violatedUniqueConstraint(error: unknown): string | undefined {
  const pg = (error as PgError)?.cause ?? (error as PgError);
  return pg?.code === "23505" ? pg.constraint : undefined;
}
