import { prepareDb } from "@db/connect-db";
import { projectImageSchema } from "@db/schema/project/project-image.schema";
import { projectMarkdownSchema } from "@db/schema/project/project-markdown.schema";
import { projectVideoSchema } from "@db/schema/project/project-video.schema";
import { projectSchema } from "@db/schema/project.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { groupByField } from "app/helpers/group-by-fields";
import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetProjectContent(dbUrl: string) {
	return async (projectId: string) => {
		try {
			const db = prepareDb(dbUrl);

			const content = await db.execute(sql`
  select coalesce(json_agg(item order by position), '[]') as items
  from (
    select json_build_object(
      'id', id,
      'type', type,
      'url', url,
      'caption', caption,
      'position', position
    ) as item,
    position
    from ${projectImageSchema}
    where project_id = ${projectId}

    union all

    select json_build_object(
      'id', id,
      'type', type,
      'url', url,
      'caption', caption,
      'position', position
    ) as item,
    position
    from ${projectVideoSchema}
    where project_id = ${projectId}

    union all

    select json_build_object(
      'id', id,
      'type', type,
      'content', markdown,
      'position', position
    ) as item,
    position
    from ${projectMarkdownSchema}
    where project_id = ${projectId}
  ) t
`);

			return content;
		} catch (error) {
			generateErrorLog("@prepareGetProjectContent:", error);
			throw new HTTPException(400, {
				message: "You were unable to get your project content",
			});
		}
	};
}
