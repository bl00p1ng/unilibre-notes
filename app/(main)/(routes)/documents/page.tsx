"use client";

import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DocumentsPage = () => {
    const { user } = useUser();
    const router = useRouter();
    const create = useMutation(api.documents.create);

    const onCreate = () => {
        const promise = create({ title: "Sin título" }).then((documentId) =>
            router.push(`/documents/${documentId}`),
        );

        toast.promise(promise, {
            loading: "Creando una nueva asinatura...",
            success: "Nueva asignatura creada!",
            error: "Error al crear una nueva asignatura.",
        });
    };

    return (
        <div className="flex h-full flex-col items-center justify-center space-y-4">
            <Image
                src="/empty.svg"
                alt="empty"
                height="300"
                width="300"
                priority
                className="h-auto dark:hidden"
            />
            <Image
                src="/empty-dark.svg"
                alt="empty"
                height="300"
                width="300"
                priority
                className="hidden h-auto dark:block"
            />
            <h2 className="text-lg font-medium">
                Bienvenido a Unilibre Notes {user?.firstName}
            </h2>
            <Button onClick={onCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear una asignatura
            </Button>
        </div>
    );
};
export default DocumentsPage;