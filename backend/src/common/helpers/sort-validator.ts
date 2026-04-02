/**
 * Sort column validator — chong SQL injection cho ORDER BY.
 * Thay the pattern ALLOWED_SORT copy-paste o moi service.
 */

/**
 * Validate va tra ve safe sort column.
 * @param sort - Column name tu client
 * @param alias - Table alias (vd: 'product', 'article')
 * @param allowlist - Map: client key -> DB column (vd: { name: 'product.name' })
 * @param fallback - Default sort column neu khong match
 */
export function resolveSortColumn(
  sort: string,
  alias: string,
  allowlist: Record<string, string>,
  fallback?: string,
): string {
  if (allowlist[sort]) {
    return allowlist[sort];
  }
  return fallback || `${alias}.created_at`;
}

/**
 * Tao allowlist tu danh sach columns.
 * buildSortAllowlist('product', ['name', 'price', 'created_at'])
 * => { name: 'product.name', price: 'product.price', created_at: 'product.created_at' }
 */
export function buildSortAllowlist(
  alias: string,
  columns: string[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const col of columns) {
    map[col] = `${alias}.${col}`;
  }
  return map;
}
