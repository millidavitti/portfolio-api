import {
	ProjectVideo,
	projectVideoSchema,
} from "@db/schema/project/project-video.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { ExtractTablesWithRelations, and, eq, notInArray } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateProjectVideo(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, projectVideos: ProjectVideo[]) => {
		try {
			await tx.transaction(async (tx) => {
				await tx.delete(projectVideoSchema).where(
					and(
						eq(projectVideoSchema.projectId, projectId),
						notInArray(
							projectVideoSchema.id,
							projectVideos.map((video) => video.id),
						),
					),
				);
				if (projectVideos.length) {
					const promises = projectVideos.map((video) => {
						return tx
							.insert(projectVideoSchema)
							.values({ ...video, projectId })
							.onConflictDoUpdate({
								target: projectVideoSchema.id,
								set: { ...video },
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
			generateErrorLog("@prepareUpdateProjectVideo", error);
			throw new HTTPException(400, {
				message: "You were unable to update your project videos",
			});
		}
	};
}
