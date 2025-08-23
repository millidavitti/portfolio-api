export type WorkerBindings = {
	DATABASE_URL: string;
	PORTFOLIO_HYPERDRIVE: Hyperdrive;
	RESEND_APIKEY: string;
	RESEND_FROM: string;
	ORIGIN: string;
	AUTH_SECRET: string;
};
export type Hyperdrive = {
	connectionString: string;
	port: number;
	host: string;
	password: string;
	user: string;
	database: string;
};
