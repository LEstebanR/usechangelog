// The unique constraint a failed write hit, if any. Drizzle wraps the Postgres error in `cause`.
export function violatedUniqueConstraint(error: unknown): string | undefined {
  const pg = (error as { cause?: { code?: string; constraint?: string } })?.cause;
  return pg?.code === "23505" ? pg.constraint : undefined;
}
