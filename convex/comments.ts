import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        documentId: v.id("documents"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        // Verificar que el documento existe y el usuario tiene acceso
        const document = await ctx.db.get(args.documentId);
        if (!document) {
            throw new Error("Document not found");
        }

        // Si no está publicado, verificar que es el propietario
        if (!document.isPublished && document.userId !== userId) {
            throw new Error("Not authorized");
        }

        const comment = await ctx.db.insert("comments", {
            documentId: args.documentId,
            content: args.content,
            userId,
            createdAt: Date.now(),
        });

        return comment;
    },
});

export const getByDocument = query({
    args: {
        documentId: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        // Verificar que el documento existe
        const document = await ctx.db.get(args.documentId);
        if (!document) {
            throw new Error("Document not found");
        }

        // Si el documento está publicado, cualquiera puede ver los comentarios
        if (document.isPublished) {
            const comments = await ctx.db
                .query("comments")
                .withIndex("by_document_created", (q) =>
                    q.eq("documentId", args.documentId)
                )
                .order("desc")
                .collect();

            return comments;
        }

        // Si no está publicado, verificar autenticación y permisos
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;
        if (document.userId !== userId) {
            throw new Error("Not authorized");
        }

        const comments = await ctx.db
            .query("comments")
            .withIndex("by_document_created", (q) =>
                q.eq("documentId", args.documentId)
            )
            .order("desc")
            .collect();

        return comments;
    },
});

export const remove = mutation({
    args: {
        id: v.id("comments"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const comment = await ctx.db.get(args.id);
        if (!comment) {
            throw new Error("Comment not found");
        }

        // Solo el autor del comentario puede eliminarlo
        if (comment.userId !== userId) {
            throw new Error("Not authorized");
        }

        await ctx.db.delete(args.id);
        return { success: true };
    },
});