import { projectTechnologySchema } from "@db/schema/project-technology.schema";
import { Technology, ZodTechnology } from "@db/schema/technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { ExtractTablesWithRelations, and, eq, notInArray } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateProjectTechnologies(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, projectTechnologies: Technology[]) => {
		try {
			await tx.transaction(async (tx) => {
				await tx.delete(projectTechnologySchema).where(
					and(
						eq(projectTechnologySchema.projectId, projectId),
						notInArray(
							projectTechnologySchema.technologyId,
							projectTechnologies.map((technology) => technology.id),
						),
					),
				);

				// Prepare new associations to insert.
				if (projectTechnologies.length > 0) {
					await tx
						.insert(projectTechnologySchema)
						.values(
							projectTechnologies.map((technology) => ({
								projectId,
								technologyId: technology.id,
							})),
						)
						.onConflictDoNothing();
				}
			});
		} catch (error) {
			generateErrorLog("@prepareUpdateProjectTechnologies", error);
			throw new HTTPException(400, {
				message: "You were unable to update your project technologies",
			});
		}
	};
}
