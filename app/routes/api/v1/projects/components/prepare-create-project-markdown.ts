import {
	ProjectMarkdown,
	projectMarkdownSchema,
} from "@db/schema/project/project-markdown.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";

export function prepareCreateProjectMarkdowns(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, projectMarkdowns: ProjectMarkdown[]) => {
		try {
			if (projectMarkdowns.length) {
				const results = await tx.insert(projectMarkdownSchema).values(
					projectMarkdowns.map((markdown: ProjectMarkdown) => ({
						projectId,
						...markdown,
					})),
				);

				return results;
			}
		} catch (error) {
			generateErrorLog("@prepareCreateProjectMarkdowns", error);
			throw new HTTPException(400, {
				message: "You were unable to create project markdowns",
			});
		}
	};
}
