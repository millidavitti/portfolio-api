import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { ProjectContent } from "./prepare-create-project-content";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";
import { prepareUpdateProjectImages } from "./prepare-update-project-images";
import { prepareUpdateProjectVideo } from "./prepare-update-project-videos";
import { prepareUpdateProjectMarkdown } from "./prepare-update-project-markdown";

export function prepareUpdateProjectContent(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, content: ProjectContent) => {
		try {
			const projectImages = content.filter(
				(content) => content.type === "image",
			);
			const projectVideos = content.filter(
				(content) => content.type === "video",
			);
			const projectMarkdowns = content.filter(
				(content) => content.type === "markdown",
			);
			const updateProjectImages = prepareUpdateProjectImages(tx);
			const updateProjectVideo = prepareUpdateProjectVideo(tx);
			const updateProjectMarkdown = prepareUpdateProjectMarkdown(tx);

			const promises = [
				updateProjectImages(projectId, projectImages),
				updateProjectVideo(projectId, projectVideos),
				updateProjectMarkdown(projectId, projectMarkdowns),
			];
			const info = await Promise.all(promises);

			return info;
		} catch (error) {
			generateErrorLog("@prepareUpdateProjectContent", error);
			throw new HTTPException(400, {
				message: "You were unable to update your project content",
			});
		}
	};
}
