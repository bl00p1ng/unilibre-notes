"use client";

import { useEffect, useState } from "react";
import { File } from "lucide-react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { api } from "@/convex/_generated/api";
import { StarRating } from "./star-rating";
import { Button } from "./ui/button";

export const SearchCommand = () => {
    const { user } = useUser();
    const router = useRouter();
    const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
    const documents = useQuery(api.documents.getSearch, { 
        rating: selectedRating 
    });
    const [isMounted, setIsMounted] = useState(false);

    const toggle = useSearch((store) => store.toggle);
    const isOpen = useSearch((store) => store.isOpen);
    const onClose = useSearch((store) => store.onClose);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggle();
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [toggle]);

    const onSelect = (id: string) => {
        router.push(`/documents/${id}`);
        onClose();
    };

    const handleRatingFilter = (rating: number) => {
        setSelectedRating(selectedRating === rating ? undefined : rating);
    };

    const clearFilters = () => {
        setSelectedRating(undefined);
    };

    if (!isMounted) {
        return null;
    }

    return (
        <CommandDialog open={isOpen} onOpenChange={onClose}>
            <CommandInput placeholder={`Buscar apuntes...`} />
            <div className="p-2 border-b">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">Filtrar por puntuación:</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs"
                    >
                        Todos
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                            key={rating}
                            variant={selectedRating === rating ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleRatingFilter(rating)}
                            className="h-8 px-2"
                        >
                            <StarRating value={rating} readonly size="sm" />
                        </Button>
                    ))}
                </div>
            </div>
            <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup heading="Asignaturas">
                    {documents?.map((document) => (
                        <CommandItem
                            key={document._id}
                            value={document._id}
                            title={document.title}
                            onSelect={onSelect}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                    {document.icon ? (
                                        <p className="mr-2 text-[1.125rem]">{document.icon}</p>
                                    ) : (
                                        <File className="mr-2 h-4 w-4" />
                                    )}
                                    <span>{document.title}</span>
                                </div>
                                {document.rating && (
                                    <StarRating 
                                        value={document.rating} 
                                        readonly 
                                        size="sm" 
                                    />
                                )}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
};