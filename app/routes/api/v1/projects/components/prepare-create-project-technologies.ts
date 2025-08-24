import { projectTechnologySchema } from "@db/schema/project-technology.schema";
import { Technology, ZodTechnology } from "@db/schema/technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";

export function prepareCreateProjectTechnologies(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, projectTechnologies: Technology[]) => {
		try {
			if (projectTechnologies.length) {
				const results = await tx
					.insert(projectTechnologySchema)
					.values(
						projectTechnologies.map((technology) => {
							return { projectId, technologyId: technology.id };
						}),
					)
					.returning();
				return results;
			}
		} catch (error) {
			generateErrorLog("@prepareCreateProjectTechnologies", error);
			throw new HTTPException(400, {
				message: "You were unable to add project technologies",
			});
		}
	};
}
