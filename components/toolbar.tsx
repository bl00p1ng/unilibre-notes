"use client";

import { ElementRef, useRef, useState } from "react";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import { useCoverImage } from "@/hooks/useCoverImage";

import { Button } from "./ui/button";
import TextareaAutosize from "react-textarea-autosize";
import { IconPicker } from "./icon-picker";
import { StarRating } from "./star-rating";
import { ImageIcon, Smile, X } from "lucide-react";

interface ToolbarProps {
    initialData: Doc<"documents">;
    preview?: boolean;
}

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
    const inputRef = useRef<ElementRef<"textarea">>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialData.title);

    const update = useMutation(api.documents.update);
    const removeIcon = useMutation(api.documents.removeIcon);
    const coverImage = useCoverImage();

    const enableInput = () => {
        if (preview) return;

        setIsEditing(true);
        setTimeout(() => {
            setValue(initialData.title);
            inputRef.current?.focus();
        }, 0);
    };

    const disableInput = () => setIsEditing(false);

    const onInput = (value: string) => {
        setValue(value);
        update({
            id: initialData._id,
            title: value || "Sin título",
        });
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            disableInput();
        }
    };

    const onIconSelect = (icon: string) => {
        update({
            id: initialData._id,
            icon,
        });
    };

    const onRemoveIcon = () => {
        removeIcon({
            id: initialData._id,
        });
    };

    const onRatingChange = (rating: number) => {
        update({
            id: initialData._id,
            rating,
        });
    };

    return (
        <div className="group relative pl-12">
            {!!initialData.icon && !preview && (
                <div className="group/icon flex items-center gap-x-2 pt-6">
                    <IconPicker onChange={onIconSelect}>
                        <p className="text-6xl transition hover:opacity-75">
                            {initialData.icon}
                        </p>
                    </IconPicker>
                    <Button
                        onClick={onRemoveIcon}
                        className="rounded-full text-xs text-muted-foreground opacity-0 transition group-hover/icon:opacity-100"
                        variant="outline"
                        size="icon"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {!!initialData.icon && preview && (
                <p className="pt-6 text-6xl">{initialData.icon}</p>
            )}
            <div className="flex items-center gap-x-1 py-2 group-hover:opacity-100 md:opacity-0">
                {!initialData.icon && !preview && (
                    <IconPicker asChild onChange={onIconSelect}>
                        <Button
                            className="text-xs text-muted-foreground"
                            variant="outline"
                            size="sm"
                        >
                            <Smile className="mr-2 h-4 w-4" />
                            Agregar ícono
                        </Button>
                    </IconPicker>
                )}
                {!initialData.coverImage && !preview && (
                    <Button
                        onClick={coverImage.onOpen}
                        className="text-xs text-muted-foreground"
                        variant="outline"
                        size="sm"
                    >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Agregar portada
                    </Button>
                )}
            </div>
            {/* Sección de puntuación */}
            {!preview && (
                <div className="flex items-center gap-x-2 py-2 group-hover:opacity-100 md:opacity-0">
                    <span className="text-sm font-medium text-[hsl(var(--ul-red))]">Puntuación:</span>
                    <StarRating
                        value={initialData.rating || 0}
                        onChange={onRatingChange}
                        size="md"
                    />
                </div>
            )}
            {/* Mostrar puntuación en modo preview */}
            {preview && initialData.rating && (
                <div className="flex items-center gap-x-2 py-2">
                    <span className="text-sm font-medium text-[hsl(var(--ul-red))]">Puntuación:</span>
                    <StarRating
                        value={initialData.rating}
                        readonly
                        size="md"
                    />
                </div>
            )}
            {isEditing && !preview ? (
                <TextareaAutosize
                    ref={inputRef}
                    spellCheck="false"
                    onBlur={disableInput}
                    onKeyDown={onKeyDown}
                    value={value}
                    onChange={(e) => onInput(e.target.value)}
                    className="resize-none break-words bg-transparent text-5xl font-bold text-[#3F3F3F] outline-none dark:text-[#CFCFCF]"
                />
            ) : (
                <div
                    onClick={enableInput}
                    className="break-words pb-[.7188rem] text-5xl font-bold  text-[#3F3F3F] outline-none dark:text-[#CFCFCF]"
                >
                    {initialData.title}
                </div>
            )}
        </div>
    );
};