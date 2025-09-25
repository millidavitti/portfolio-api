import { prepareDb } from "@db/connect-db";
import { projectSchema, ZodProject } from "@db/schema/project.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";
import { prepareCreateProjectTechnologies } from "./prepare-create-project-technologies";
import { prepareCreateProjectContent } from "./prepare-create-project-content";
import { ZodProjectImage } from "@db/schema/project/project-image.schema";
import { ZodProjectMarkdown } from "@db/schema/project/project-markdown.schema";
import { ZodProjectVideo } from "@db/schema/project/project-video.schema";
import { ZodTechnology } from "@db/schema/technology.schema";
import z from "zod";

export function prepareCreateProject(dbUrl: string) {
	return async (profileId: string, project: ProjectData) => {
		try {
			const db = prepareDb(dbUrl);
			return await db.transaction(async (tx) => {
				const [result] = await tx
					.insert(projectSchema)
					.values({
						profileId,
						...project.project,
					})
					.returning();
				const projectId = result.id;
				const createProjectTechnologies = prepareCreateProjectTechnologies(tx);
				await createProjectTechnologies(projectId, project.technologies);

				const createProjectContent = prepareCreateProjectContent(tx);
				await createProjectContent(projectId, project.content);
				return result;
			});
		} catch (error) {
			generateErrorLog("@prepareCreateProject", error);
			throw new HTTPException(400, {
				message: "You were unable to create a project",
			});
		}
	};
}

export const ZodProjectData = z.object({
	project: ZodProject,
	technologies: ZodTechnology.array(),
	content: z
		.union([ZodProjectImage, ZodProjectVideo, ZodProjectMarkdown])
		.array(),
});

export type ProjectData = z.infer<typeof ZodProjectData>;
