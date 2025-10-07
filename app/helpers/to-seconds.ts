export function toSeconds(
	value: number,
	unit: "minute" | "hour" | "day",
	mode: "timestamp" | "duration" = "timestamp",
): number {
	const map = {
		minute: 60,
		hour: 60 * 60,
		day: 60 * 60 * 24,
	} as const;

	const duration = value * map[unit];

	switch (mode) {
		case "duration":
			return duration;
		case "timestamp":
			return duration + Math.floor(Date.now() / 1000);
		default:
			return duration + Math.floor(Date.now() / 1000);
	}
}
