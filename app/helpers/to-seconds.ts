export function toSeconds(
	duration: number,
	unit: "minute" | "hour" | "day",
): number {
	const map = {
		minute: 60,
		hour: 60 * 60,
		day: 60 * 60 * 24,
	} as const;

	return duration * map[unit];
}
