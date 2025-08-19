type GroupByFieldParams<T> = {
	data: T[];
	primaryKey: keyof T;
	aggregateFields: Record<string, keyof T>;
};

export function groupByField<T extends Record<string, any>>(
	params: GroupByFieldParams<T>,
): Record<string, any>[] {
	const { data, primaryKey, aggregateFields } = params;

	const groupedData = data.reduce((acc, row) => {
		const groupId = row[primaryKey].id;

		if (!acc[groupId]) {
			acc[groupId] = { ...row[primaryKey] };

			// Initialize aggregate fields as empty arrays
			// if (data.length > 1)
			Object.keys(aggregateFields).forEach((key) => {
				acc[groupId][key] = [];
			});
		}

		// Dynamically aggregate unique values for each field
		// if (data.length > 1)
		Object.entries(aggregateFields).forEach(([key, value]) => {
			const item = row[value] as { id: string };
			if (
				item &&
				!acc[groupId][key].some((i: { id: string }) => i.id === item.id)
			) {
				acc[groupId][key].push(item);
			}
		});
		// else
		// 	Object.entries(aggregateFields).forEach(([key, value]) => {
		// 		const item = row[value] as { id: string };
		// 		acc[groupId][key] = item;
		// 	});
		return acc;
	}, {} as Record<string, any>);

	return Object.values(groupedData);
}
