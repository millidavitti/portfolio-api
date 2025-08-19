import chalk from "chalk";
import { getErrorMessage } from "./get-error-message";

export function generateErrorLog(
	fnName: string,
	error: unknown,
	mode: "slient" | "throw" = "slient",
) {
	const log = `🚨 ${chalk.red.bold("[Error]")}: ${chalk.blue.bold(
		fnName,
	)} - | ${chalk.cyan.bold("Message")}: ${chalk.bold(getErrorMessage(error))}`;
	console.error(log);
	console.error(error);
	if (mode === "throw") throw new Error(getErrorMessage(error));
}
