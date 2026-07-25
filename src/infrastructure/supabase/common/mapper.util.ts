export type MapFn<TSource, TDomain> = (row: TSource) => TDomain;

export function mapList<TSource, TDomain>(rows: TSource[], fn: MapFn<TSource, TDomain>): TDomain[] {
  return rows.map(fn);
}
