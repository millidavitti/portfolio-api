export function getErrorMessage(error: unknown) {
	return (error as Record<string, string>).message;
}
