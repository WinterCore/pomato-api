import {Router} from "oak/router.ts";
import {IAuthState, authenticated} from "../middleware/authenticated.ts";
import {Project} from "../database/projects.ts";
import {Bson} from "mongo/mod.ts";
import {IProject, projectSchema, toProject} from "../types/project.ts";
import {objectId} from "../types/common.ts";
import {z} from "zod/mod.ts";
import {BodyStateFromSchema, validate, validateParams} from "../middleware/validate.ts";

type IRouterState = IAuthState;
export const ProjectsRouter = new Router<IRouterState>({
    prefix: "/projects",
});
ProjectsRouter.use(authenticated);

/**
 * Get all projects
 */
ProjectsRouter.get("/", async (ctx) => {
    const userId = ctx.state.userID;

    const projects = await Project
        .find({
            userId: new Bson.ObjectId(userId),
            deleted: false,
        })
        .toArray();

    ctx.response.body = {
        data: projects.map(toProject),
    };
});


/**
 * Create a new project
 */
const createProjectSchema = z.strictObject({ project: projectSchema });

ProjectsRouter.post<
    "/",
    never,
    BodyStateFromSchema<typeof createProjectSchema> & IRouterState
>("/", validate(createProjectSchema), async (ctx) => {
    const userId = ctx.state.userID;

    const insertedId = await Project.insertOne({
        ...ctx.state.body.project,
        userId: new Bson.ObjectId(userId),
        deleted: false,
    });
    
    if (! insertedId) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Something happened" };
        return;
    }

    const project: IProject = {
        id: insertedId.toString(),
        ...ctx.state.body.project,
    };

    ctx.response.body = {
        message: "Project created successfully",
        project,
    };
});


/**
 * Update an existing project
 */

const updateProjectSchema = z.strictObject({ project: projectSchema });

ProjectsRouter.put<
    "/:projectId",
    { projectId: string },
    BodyStateFromSchema<typeof updateProjectSchema> & IRouterState
>("/:projectId", validate(updateProjectSchema), async (ctx) => {
    const projectId = ctx.params.projectId;
    const userId = ctx.state.userID;

    const result = await Project.updateOne(
        {
            _id: new Bson.ObjectId(projectId),
            userId: new Bson.ObjectId(userId),
            deleted: false,
        },
        { $set: { ...ctx.state.body.project } },
    );

    if (result.matchedCount === 0) {
        ctx.response.status = 404;
        ctx.response.body = {
            message: "Project not found!"
        };
        return;
    }

    const updatedProject: IProject = {
        id: projectId.toString(),
        ...ctx.state.body.project,
    };
    
    ctx.response.body = {
        message: "Project updated successfully!",
        project: updatedProject,
    };
});


/**
 * Delete a project
 */

ProjectsRouter.delete<
    "/:projectId",
    { projectId: string },
    IRouterState
>(
    "/:projectId",
    validateParams(z.object({ projectId: objectId })),
    async (ctx) => {
        const projectId = ctx.params.projectId;
        const userId = ctx.state.userID;

        const result = await Project.updateOne(
            {
                _id: new Bson.ObjectId(projectId),
                userId: new Bson.ObjectId(userId),
                deleted: false,
            },
            { $set: { deleted: true } },
        );

        if (result.modifiedCount === 0) {
            ctx.response.status = 404;
            ctx.response.body = {
                message: "Project not found!"
            };
            return;
        }
        
        ctx.response.body = {
            message: "Project deleted successfully!",
        };
    });

