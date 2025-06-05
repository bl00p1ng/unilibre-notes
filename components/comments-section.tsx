"use client";

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageSquare, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface CommentSectionProps {
    documentId: Id<"documents">;
}

export const CommentSection = ({ documentId }: CommentSectionProps) => {
    const { user } = useUser();
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const comments = useQuery(api.comments.getByDocument, { documentId });
    const createComment = useMutation(api.comments.create);
    const deleteComment = useMutation(api.comments.remove);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await createComment({
                documentId,
                content: newComment.trim(),
            });
            setNewComment("");
            toast.success("Comentario agregado");
        } catch (error) {
            toast.error("Error al agregar comentario");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: Id<"comments">) => {
        try {
            await deleteComment({ id: commentId });
            toast.success("Comentario eliminado");
        } catch (error) {
            toast.error("Error al eliminar comentario");
        }
    };

    const getUserInitials = (name?: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (comments === undefined) {
        return (
            <div className="mt-8 pt-6 border-t">
                <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-16 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 pt-6 border-t">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="h-5 w-5 text-[hsl(var(--ul-red))]" />
                <h3 className="text-lg font-semibold text-[hsl(var(--ul-red))]">
                    Comentarios ({comments.length})
                </h3>
            </div>

            {/* Formulario para nuevo comentario */}
            {user && (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback className="text-xs">
                                {getUserInitials(user.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Textarea
                                placeholder="Escribe un comentario..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[80px] resize-none"
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-end mt-2">
                                <Button
                                    type="submit"
                                    disabled={!newComment.trim() || isSubmitting}
                                    className="bg-[hsl(var(--ul-red))] hover:bg-[hsl(var(--ul-red))]/90"
                                    size="sm"
                                >
                                    {isSubmitting ? (
                                        "Enviando..."
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Comentar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* Lista de comentarios */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aún no hay comentarios</p>
                        <p className="text-sm">¡Sé el primero en comentar!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3 p-4 rounded-lg bg-muted/30">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className="text-xs">
                                    {getUserInitials(comment.userId)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                        Usuario
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt), {
                                            addSuffix: true,
                                            locale: es,
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed break-words">
                                    {comment.content}
                                </p>
                            </div>
                            {user?.id === comment.userId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(comment._id)}
                                    className="text-muted-foreground hover:text-destructive flex-shrink-0 h-8 w-8 p-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};