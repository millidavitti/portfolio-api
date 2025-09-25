import { ProjectImage } from "@db/schema/project/project-image.schema";
import { ProjectMarkdown } from "@db/schema/project/project-markdown.schema";
import { ProjectVideo } from "@db/schema/project/project-video.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";
import { prepareCreateProjectImages } from "./prepare-create-project-images";
import { prepareCreateProjectVideos } from "./prepare-project-videos";
import { prepareCreateProjectMarkdowns } from "./prepare-create-project-markdown";

export function prepareCreateProjectContent(
	tx: PgTransaction<
		NodePgQueryResultHKT,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>,
) {
	return async (projectId: string, content: ProjectContent) => {
		console.log(content);
		try {
			const projectImages: ProjectImage[] = [];
			const projectVideos: ProjectVideo[] = [];
			const projectMarkdowns: ProjectMarkdown[] = [];

			for (const element of content) {
				switch (element.type) {
					case "image":
						projectImages.push(element);
						break;
					case "video":
						projectVideos.push(element);
						break;
					case "markdown":
						projectMarkdowns.push(element);
						break;
				}
			}
			const createProjectImages = prepareCreateProjectImages(tx);
			const createProjectVideos = prepareCreateProjectVideos(tx);
			const createProjectMarkdowns = prepareCreateProjectMarkdowns(tx);

			const promises = [
				createProjectImages(projectId, projectImages),
				createProjectVideos(projectId, projectVideos),
				createProjectMarkdowns(projectId, projectMarkdowns),
			];
			const info = await Promise.all(promises);

			return info;
		} catch (error) {
			generateErrorLog("@prepareCreateProjectContent", error);
			throw new HTTPException(400, {
				message: "You were unable to add project content",
			});
		}
	};
}

export type ProjectContent = (ProjectImage | ProjectVideo | ProjectMarkdown)[];
