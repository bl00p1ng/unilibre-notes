"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { Cover } from "@/components/cover";
import { Toolbar } from "@/components/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentSection } from "@/components/comments-section";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

interface DocumentIdPageProps {
    params: {
        documentId: Id<"documents">;
    };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
    const Editor = useMemo(
        () => dynamic(() => import("@/components/editor"), { ssr: false }),
        [],
    );

    const document = useQuery(api.documents.getById, {
        documentId: params.documentId,
    });

    const update = useMutation(api.documents.update);

    const onChange = (content: string) => {
        update({
            id: params.documentId,
            content,
        });
    };

    if (document === undefined) {
        return (
            <div>
                <Cover.Skeleton />
                <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
                    <div className="space-y-4 pl-8 pt-4">
                        <Skeleton className="h-14 w-1/2" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-4 w-3/5" />
                    </div>
                </div>
            </div>
        );
    }

    if (document === null) {
        return <div>No encontrado</div>;
    }

    return (
        <div className="pb-40">
            <Cover url={document.coverImage} />
            <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
                <Toolbar initialData={document} />
                <Editor onChange={onChange} initialContent={document.content} />
                
                {/* Sección de comentarios */}
                <div className="px-8">
                    <CommentSection documentId={document._id} />
                </div>
            </div>
        </div>
    );
};
export default DocumentIdPage;