import { prepareDb } from "@db/connect-db";
import { projectTechnologySchema } from "@db/schema/project/technology.schema";
import { technologySchema } from "@db/schema/technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { groupByField } from "app/helpers/group-by-fields";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetProjectTechnologies(dbUrl: string) {
	return async (projectId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const results = await db
				.select()
				.from(projectTechnologySchema)
				.where(eq(projectTechnologySchema.projectId, projectId))
				.leftJoin(
					technologySchema,
					eq(technologySchema.id, projectTechnologySchema.technologyId),
				);
			if (results.length) {
				const [{ technologies }] = groupByField({
					data: results,
					aggregateFields: {
						technologies: "technologies",
					},
					primaryKey: "project_technologies",
				});
				return technologies;
			}
			return results;
		} catch (error) {
			generateErrorLog("@prepareGetProjectTechnologies:", error);
			throw new HTTPException(400, {
				message: "You were unable to get your project technologies",
			});
		}
	};
}
