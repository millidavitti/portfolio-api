import {
	ProjectImage,
	projectImageSchema,
} from "@db/schema/project/project-image.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";

export function prepareCreateProjectImages(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, projectImages: ProjectImage[]) => {
		try {
			if (projectImages.length) {
				const results = await tx.insert(projectImageSchema).values(
					projectImages.map((image: ProjectImage) => ({
						projectId,
						...image,
					})),
				);
				return results;
			}
		} catch (error) {
			generateErrorLog("@prepareCreateProjectImages", error);
			throw new HTTPException(400, {
				message: "You were unable to add project images",
			});
		}
	};
}
