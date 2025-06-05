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
import { cn } from "@/lib/utils";

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
            <CommandInput 
                placeholder={`Buscar apuntes...`} 
                className="text-base h-12"
            />
            <div className="p-4 border-b">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-medium text-[hsl(var(--ul-red))]">
                        Filtrar por puntuación:
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-3 text-xs hover:border-[hsl(var(--ul-red))]"
                    >
                        Todos
                    </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                            key={rating}
                            variant={selectedRating === rating ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleRatingFilter(rating)}
                            className={cn(
                                "h-10 px-3 min-w-[80px] flex items-center gap-2 transition-all",
                                selectedRating === rating 
                                    ? "text-white hover:opacity-90" 
                                    : "hover:text-[hsl(var(--ul-black))]"
                            )}
                        >
                            <StarRating value={rating} readonly size="sm" />
                            <span className="text-xs">({rating}/5)</span>
                        </Button>
                    ))}
                </div>
            </div>
            <CommandList className="max-h-96">
                <CommandEmpty className="py-8 text-center">
                    <div className="text-muted-foreground">
                        <File className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>No se encontraron resultados.</p>
                    </div>
                </CommandEmpty>
                <CommandGroup heading="Asignaturas" className="px-2">
                    {documents?.map((document) => (
                        <CommandItem
                            key={document._id}
                            value={document._id}
                            title={document.title}
                            onSelect={onSelect}
                            className="p-3 rounded-lg mb-1 cursor-pointer"
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    {document.icon ? (
                                        <div className="flex-shrink-0 text-xl">
                                            {document.icon}
                                        </div>
                                    ) : (
                                        <File className="flex-shrink-0 h-5 w-5 text-muted-foreground" />
                                    )}
                                    <span className="font-medium text-base truncate">
                                        {document.title}
                                    </span>
                                </div>
                                {document.rating && (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <StarRating 
                                            value={document.rating} 
                                            readonly 
                                            size="sm" 
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            ({document.rating}/5)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
};