export function getEnvironmentValue<T>(values: {
	[key in "production" | "development"]: T;
}) {
	return values[process.env.NODE_ENV! as "production" | "development"];
}
