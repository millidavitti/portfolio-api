import {
	ProjectImage,
	projectImageSchema,
} from "@db/schema/project/project-image.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { ExtractTablesWithRelations, and, eq, notInArray } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateProjectImages(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, projectImages: ProjectImage[]) => {
		try {
			await tx.transaction(async (tx) => {
				await tx.delete(projectImageSchema).where(
					and(
						eq(projectImageSchema.projectId, projectId),
						notInArray(
							projectImageSchema.id,
							projectImages.map((image) => image.id!),
						),
					),
				);
				if (projectImages.length) {
					const promises = projectImages.map((image) => {
						return tx
							.insert(projectImageSchema)
							.values({ ...image, projectId })
							.onConflictDoUpdate({
								target: projectImageSchema.id,
								set: { ...image },
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
			generateErrorLog("@prepareUpdateProjectImages", error);
			throw new HTTPException(400, {
				message: "You were unable to update your project image",
			});
		}
	};
}
