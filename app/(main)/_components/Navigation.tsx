"use client";

import React, { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useMutation } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { DocumentList } from "./DocumentList";
import { Item } from "./Item";
import { UserItem } from "./UserItem";

import { toast } from "sonner";
import {
    ChevronsLeft,
    MenuIcon,
    Plus,
    PlusCircle,
    Search,
    Settings,
    Trash,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { TrashBox } from "./TrashBox";
import { useSearch } from "@/hooks/useSearch";
import { useSettings } from "@/hooks/useSettings";
import { Navbar } from "./Navbar";
import Image from "next/image";

const Navigation = () => {
    const search = useSearch();
    const settings = useSettings();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const create = useMutation(api.documents.create);

    const isResizingRef = useRef(false);
    const sidebarRef = useRef<ElementRef<"aside">>(null);
    const navbarRef = useRef<ElementRef<"div">>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(isMobile);

    useEffect(() => {
        if (isMobile) {
            collapse();
        } else {
            resetWidth();
        }
    }, [isMobile]);

    useEffect(() => {
        if (isMobile) {
            collapse();
        }
    }, [pathname, isMobile]);

    const handleMouseDown = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        isResizingRef.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizingRef.current) return;
        let newWidth = e.clientX;

        if (newWidth < 240) newWidth = 240;
        if (newWidth > 480) newWidth = 480;

        if (sidebarRef.current && navbarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
            navbarRef.current.style.setProperty("left", `${newWidth}px`);
            navbarRef.current.style.setProperty(
                "width",
                `calc(100% - ${newWidth}px)`,
            );
        }
    };

    const handleMouseUp = () => {
        isResizingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    const resetWidth = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(false);
            setIsResetting(true);

            sidebarRef.current.style.width = isMobile ? "100%" : "240px";
            navbarRef.current.style.removeProperty("width");
            navbarRef.current.style.setProperty(
                "width",
                isMobile ? "0" : "calc(100%-240px)",
            );
            navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
            setTimeout(() => setIsResetting(false), 300);
        }
    };

    const collapse = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true);
            setIsResetting(true);

            sidebarRef.current.style.width = "0";
            navbarRef.current.style.setProperty("width", "100%");
            navbarRef.current.style.setProperty("left", "0");
            setTimeout(() => setIsResetting(false), 300);
        }
    };

    const handleCreate = () => {
        const promise = create({ title: "Sin título" }).then((documentId) =>
            router.push(`/documents/${documentId}`),
        );

        toast.promise(promise, {
            loading: "Creando una nueva nota...",
            success: "Nueva nota creada.",
            error: "Error al crear la nota.",
        });
    };

    return (
        <>
            <aside
                ref={sidebarRef}
                className={cn(
                    "group/sidebar relative z-[300] flex h-full w-60 flex-col bg-secondary overflow-hidden",
                    isResetting && "transition-all duration-300 ease-in-out",
                    isMobile && "w-0",
                )}
            >
                <div
                    onClick={collapse}
                    role="button"
                    className={cn(
                        "absolute right-2 top-3 h-6 w-6 rounded-sm text-muted-foreground opacity-0 transition hover:bg-neutral-300 group-hover/sidebar:opacity-100 dark:hover:bg-neutral-600",
                        isMobile && "opacity-100",
                    )}
                >
                    <ChevronsLeft className="h-6 w-6" />
                </div>
                
                {/* Contenido principal del sidebar con scroll interno */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="overflow-y-auto flex-1">
                        <div>
                            <UserItem />
                            <Item label="Buscar" icon={Search} isSearch onClick={search.onOpen} />
                            <Item label="Configuración" icon={Settings} onClick={settings.onOpen} />
                            <Item onClick={handleCreate} label="Nueva asignatura" icon={PlusCircle} />
                        </div>
                        <div className="mt-4">
                            <DocumentList />
                            <Item onClick={handleCreate} icon={Plus} label="Agregar una asignatura" />
                            <Popover>
                                <PopoverTrigger className="mt-4 w-full">
                                    <Item label="Papelera" icon={Trash} />
                                </PopoverTrigger>
                                <PopoverContent
                                    side={isMobile ? "bottom" : "right"}
                                    className="w-72 p-0"
                                >
                                    <TrashBox />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Logo y nombre de la app en la parte inferior */}
                    <div className="border-t bg-background/50 p-4 flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 flex-shrink-0">
                                <Image
                                    src="/logo.svg"
                                    alt="Zotion Logo"
                                    width={40}
                                    height={40}
                                    className="dark:hidden"
                                />
                                <Image
                                    src="/logo-dark.svg"
                                    alt="Zotion Logo"
                                    width={40}
                                    height={40}
                                    className="hidden dark:block"
                                />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-semibold ul-text-gradient truncate">
                                    Unilibre
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                    Notes
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    onMouseDown={handleMouseDown}
                    onClick={resetWidth}
                    className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-primary/10 opacity-0 transition group-hover/sidebar:opacity-100"
                ></div>
            </aside>
            <div
                ref={navbarRef}
                className={cn(
                    "absolute left-60 top-0 z-[300] w-[calc(100%-240px)]",
                    isResetting && "transition-all duration-300 ease-in-out",
                    isMobile && "left-0 w-full",
                )}
            >
                {!!params.documentId ? (
                    <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
                ) : (
                    <nav
                        className={cn(
                            "w-full bg-transparent px-3 py-2",
                            !isCollapsed && "p-0",
                        )}
                    >
                        {isCollapsed && (
                            <MenuIcon
                                onClick={resetWidth}
                                role="button"
                                className="h-6 w-6 text-muted-foreground"
                            />
                        )}
                    </nav>
                )}
            </div>
        </>
    );
};
export default Navigation;