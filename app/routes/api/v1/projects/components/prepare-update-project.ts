import { projectSchema } from "@db/schema/project.schema";
import { eq } from "drizzle-orm";
import { ProjectData } from "./prepare-create-project";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";
import { prepareDb } from "@db/connect-db";
import { prepareUpdateProjectTechnologies } from "./prepare-update-project-technologies";
import { prepareUpdateProjectContent } from "./prepare-update-project-content";

export function prepareUpdateProject(dbUrl: string) {
	return async (projectId: string, update: ProjectData) => {
		try {
			const db = prepareDb(dbUrl);
			const project = await db.transaction(async (tx) => {
				const { id: _, ...rest } = update.project;
				const [project] = await tx
					.update(projectSchema)
					.set(rest)
					.where(eq(projectSchema.id, projectId))
					.returning();
				const updateProjectTechnologies = prepareUpdateProjectTechnologies(tx);
				await updateProjectTechnologies(projectId, update.technologies);

				const updateProjectContent = prepareUpdateProjectContent(tx);
				await updateProjectContent(projectId, update.content);
				return project;
			});
			return project;
		} catch (error) {
			generateErrorLog("@prepareUpdateProject", error);
			throw new HTTPException(400, {
				message: "You were unable to update your project",
			});
		}
	};
}
