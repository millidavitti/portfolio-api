export function parseCookies(cookieString: string): Record<string, string> {
	const cookies: Record<string, string> = {};

	cookieString.split(";").forEach((cookie) => {
		const [key, value] = cookie.split("=").map((c) => c.trim());
		if (!key || !value) return;
		cookies[key] = value;
	});

	return cookies;
}
