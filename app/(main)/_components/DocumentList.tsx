"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import { Item } from "./Item";
import { StarRating } from "@/components/star-rating";

import { FileIcon } from "lucide-react";

interface DocumentListProps {
    parentDocumentId?: Id<"documents">;
    level?: number;
    data?: Doc<"documents">[];
}

export const DocumentList = ({
    parentDocumentId,
    level = 0,
}: DocumentListProps) => {
    const params = useParams();
    const router = useRouter();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const onExpand = (documentId: string) => {
        setExpanded((prevExpanded) => ({
            ...prevExpanded,
            [documentId]: !prevExpanded[documentId],
        }));
    };

    const documents = useQuery(api.documents.getSidebar, {
        parentDocument: parentDocumentId,
    });

    const onRedirect = (documentId: string) => {
        router.push(`/documents/${documentId}`);
    };

    if (documents === undefined) {
        return (
            <>
                <Item.Skeleton level={level} />
                {level === 0 && (
                    <>
                        <Item.Skeleton level={level} />
                        <Item.Skeleton level={level} />
                    </>
                )}
            </>
        );
    }

    return (
        <>
            <p
                style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
                className={cn(
                    "hidden text-sm font-medium text-muted-foreground/80",
                    expanded && "last:block",
                    level === 0 && "hidden",
                )}
            >
                No hay páginas dentro
            </p>
            {documents?.map((document) => (
                <div key={document._id}>
                    <div className="flex items-center justify-between group">
                        <div className="flex-1">
                            <Item
                                id={document._id}
                                onClick={() => onRedirect(document._id)}
                                label={document.title}
                                icon={FileIcon}
                                documentIcon={document.icon}
                                active={params.documentId === document._id}
                                level={level}
                                onExpand={() => onExpand(document._id)}
                                expanded={expanded[document._id]}
                            />
                        </div>
                        {document.rating && (
                            <div className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <StarRating 
                                    value={document.rating} 
                                    readonly 
                                    size="sm" 
                                />
                            </div>
                        )}
                    </div>
                    {expanded[document._id] && (
                        <DocumentList parentDocumentId={document._id} level={level + 1} />
                    )}
                </div>
            ))}
        </>
    );
};