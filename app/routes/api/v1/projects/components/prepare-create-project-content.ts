import { generateErrorLog } from "app/helpers/generate-error-log";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";
import {
	ProjectContent,
	projectContentSchema,
} from "@db/schema/project/content.schema";

export function prepareCreateProjectContent(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, content: ProjectContent[]) => {
		try {
			await tx
				.insert(projectContentSchema)
				.values(content.map((content) => ({ ...content, projectId })));
		} catch (error) {
			generateErrorLog("@prepareCreateProjectContent", error);
			throw new HTTPException(400, {
				message: "You were unable to add project content",
			});
		}
	};
}
