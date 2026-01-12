import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 4,
        },
    })
        .onUploadComplete(async ({ metadata: _metadata, file }) => {
            console.log("Upload complete for userId:", _metadata);
            console.log("file url", file.url);
            return { uploadedBy: "system" };
        }),

    importUploader: f({
        blob: {
            maxFileSize: "8MB",
            maxFileCount: 1,
        },
    })
        .onUploadComplete(async ({ metadata: _metadata, file }) => {
            console.log("Import file upload complete:", file.url);
            return { url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
