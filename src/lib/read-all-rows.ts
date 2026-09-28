/** Read every page in a stable order; never turn a failed read into missing choices. */
export async function readAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{
    data: T[] | null
    error: { message: string } | null
  }>,
): Promise<T[]> {
  const rows: T[] = []
  const pageSize = 500
  for (;;) {
    const { data, error } = await fetchPage(rows.length, rows.length + pageSize - 1)
    if (error) throw new Error(`Could not load complete summary: ${error.message}`)
    if (!data) throw new Error('Could not load complete summary: missing response')
    // Continue even after a short page: the server may enforce a smaller limit.
    if (data.length === 0) return rows
    rows.push(...data)
  }
}
