import {
	ProjectMarkdown,
	projectMarkdownSchema,
} from "@db/schema/project/project-markdown.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { ExtractTablesWithRelations, and, eq, notInArray } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateProjectMarkdown(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, projectMarkdowns: ProjectMarkdown[]) => {
		try {
			await tx.transaction(async (tx) => {
				tx.delete(projectMarkdownSchema).where(
					and(
						eq(projectMarkdownSchema.projectId, projectId),
						notInArray(
							projectMarkdownSchema.id,
							projectMarkdowns.map((md) => md.id),
						),
					),
				);
				if (projectMarkdowns.length) {
					const promises = projectMarkdowns.map((markdown) => {
						return tx
							.insert(projectMarkdownSchema)
							.values({ ...markdown, projectId })
							.onConflictDoUpdate({
								target: projectMarkdownSchema.id,
								set: { ...markdown },
							});
					});

					const results = await Promise.all(promises);
					return results.reduce(
						(acc, info) => {
							const rowCount = info.rowCount || 0;
							return { ...info, rowCount: rowCount + acc.rowCount };
						},
						{ rowCount: 0 },
					);
				}
			});
		} catch (error) {
			generateErrorLog("@prepareUpdateProjectMarkdown", error);
			throw new HTTPException(400, {
				message: "You were unable to update your project markdown",
			});
		}
	};
}
