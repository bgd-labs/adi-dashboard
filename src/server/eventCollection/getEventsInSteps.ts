export async function getEventsInSteps<T>({
  from,
  to,
  limit,
  callback,
}: {
  from: number;
  to: number;
  limit: number;
  callback: (from: number, to: number) => Promise<T>;
}) {
  const blockSteps = Math.ceil((to - from) / limit);

  const results: T[] = [];

  for (let count = 0; count < blockSteps; count++) {
    const fromBlockNumber = from + limit * count;
    const toBlockNumber = Math.min(from + limit * (count + 1), to);

    const result = await callback(fromBlockNumber, toBlockNumber);
    if (Array.isArray(result)) {
      results.push(...result);
    } else {
      results.push(result);
    }
  }

  return results;
}
