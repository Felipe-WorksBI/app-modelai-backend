type Props = {
  regId: string | number;
  company: {
    companyId: string | null;
    companyName?: string | null;
    status?: string | null;
  } | null;
};

type GroupedResult<T extends Props> = Omit<T, 'company'> & {
  companies: NonNullable<T['company']>[];
};

export function groupByProject<T extends Props>(rows: T[]): GroupedResult<T>[] {
  const map = new Map<string | number, GroupedResult<T>>();

  for (const row of rows) {
    const id = row.regId;

    if (!map.has(id)) {
      const { company, ...rest } = row;
      map.set(id, {
        ...rest,
        companies: [],
      } as GroupedResult<T>);
    }

    const ref = map.get(id)!;

    if (row.company?.companyId) {
      ref.companies.push(row.company as NonNullable<T['company']>);
    }
  }

  return Array.from(map.values());
}