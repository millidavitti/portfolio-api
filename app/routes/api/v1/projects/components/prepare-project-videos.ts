import {
	ProjectVideo,
	projectVideoSchema,
} from "@db/schema/project/project-video.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";

export function prepareCreateProjectVideos(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, projectVideos: ProjectVideo[]) => {
		try {
			if (projectVideos.length) {
				const results = await tx.insert(projectVideoSchema).values(
					projectVideos.map((video: ProjectVideo) => ({
						projectId,
						...video,
					})),
				);

				return results;
			}
		} catch (error) {
			generateErrorLog("@prepareCreateProjectVideos", error);
			throw new HTTPException(400, {
				message: "You were unable to create project videos",
			});
		}
	};
}
