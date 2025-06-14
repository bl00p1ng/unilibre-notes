import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    documents: defineTable({
        title: v.string(),
        userId: v.string(),
        isArchived: v.boolean(),
        parentDocument: v.optional(v.id("documents")),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.boolean(),
        rating: v.optional(v.number())
    })
        .index("by_user", ["userId"])
        .index("by_user_parent", ["userId", "parentDocument"])
        .index("by_user_rating", ["userId", "rating"]),

    comments: defineTable({
        documentId: v.id("documents"),
        userId: v.string(),
        content: v.string(),
        createdAt: v.number(),
    })
        .index("by_document", ["documentId"])
        .index("by_document_created", ["documentId", "createdAt"]),
});
