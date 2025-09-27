import { and, eq, ExtractTablesWithRelations, notInArray } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";
import {
	ProjectContent,
	projectContentSchema,
} from "@db/schema/project/content.schema";

export function prepareUpdateProjectContent(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, content: ProjectContent[]) => {
		try {
			await tx.delete(projectContentSchema).where(
				and(
					eq(projectContentSchema.projectId, projectId),
					notInArray(
						projectContentSchema.id,
						content.map((c) => c.id!),
					),
				),
			);
			await Promise.all(
				content.map((content) => {
					return tx
						.insert(projectContentSchema)
						.values({ ...content, projectId })
						.onConflictDoUpdate({
							target: projectContentSchema.id,
							set: { ...content, id: undefined },
						});
				}),
			);
		} catch (error) {
			generateErrorLog("@prepareUpdateProjectContent", error);
			throw new HTTPException(400, {
				message: "You were unable to update your project content",
			});
		}
	};
}
