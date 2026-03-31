"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { config } from "@/data/config";
import Link from "next/link";
import { useTranslations } from "@/i18n/provider";
import { AlertTriangle, Check, Home, Inbox, Link2, Loader2, Settings2 } from "lucide-react";
import { DesktopSidebar, MobileSidebar } from "@/components/layout/sidebar";
import Toolbar from "@/components/layout/toolbar";
import Timeline from "@/components/content/timeline";
import DetailPanel from "@/components/content/detail";
import DiffDialog from "@/components/modules/diff";
import EditorDialog from "@/components/dialogs/editor";
import Notifications from "@/components/modules/notifications";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDataFetcher } from "@/hooks/fetcher";
import { useKeyboardShortcuts } from "@/hooks/keyboard";
import { useLocalStorage } from "@/hooks/storage";
import { hashEntry } from "@/lib/hash";
import { cn } from "@/lib/utils";
import { detectFields } from "@/data/fields";
import { defaultFilters } from "@/data/presets";
import type { Filters } from "@/data/presets";
import { interval, statusDotColor } from "@/data/constants";
import type { Endpoint, SavedViewState, Settings } from "@/data/endpoints";

const defaultSettings: Settings = {
    interval: interval,
    autoScroll: true,
    notifications: false,
    sound: false,
};

function ViewerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const api = searchParams.get("api");
    const t = useTranslations("monitor");
    const td = useTranslations("diff");
    const ts = useTranslations("shortcuts");

    const [filters, setFilters] = useLocalStorage<Filters>("filters", defaultFilters);
    const [settings, setSettings] = useLocalStorage<Settings>("settings", defaultSettings);
    const [endpoints, setEndpoints] = useLocalStorage<Endpoint[]>("endpoints", []);
    const [, setLastApi] = useLocalStorage<string>("lastApi", "");
    const [sidebarWidth] = useLocalStorage<number>("sidebarWidth", 288);
    const [detailWidth] = useLocalStorage<number>("detailWidth", 384);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [allPins, setAllPins] = useLocalStorage<Record<string, string[]>>("pins", {});
    const pinnedHashes = useMemo(() => new Set(api ? (allPins[api] ?? []) : []), [allPins, api]);
    const setPinnedHashes = useCallback(
        (update: Set<string> | ((prev: Set<string>) => Set<string>)) => {
            if (!api) return;
            setAllPins((prev) => {
                const prevSet = new Set(prev[api] ?? []);
                const next = update instanceof Function ? update(prevSet) : update;
                const arr = [...next];
                if (arr.length === 0) {
                    const rest = Object.fromEntries(
                        Object.entries(prev).filter(([key]) => key !== api)
                    );
                    return rest;
                }
                return { ...prev, [api]: arr };
            });
        },
        [api, setAllPins]
    );
    const [compareMode, setCompareMode] = useState(false);
    const [compareSelection, setCompareSelection] = useState<Record<string, unknown>[]>([]);
    const [diffOpen, setDiffOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const endpointsRef = useRef(endpoints);
    const entryParam = searchParams.get("entry");

    useEffect(() => {
        endpointsRef.current = endpoints;
    }, [endpoints]);

    useEffect(() => {
        if (api) setLastApi(api);
    }, [api, setLastApi]);

    // Auto-sync savedState for the current endpoint when remember is enabled
    useEffect(() => {
        if (!api) return;
        setEndpoints((prev) => {
            const ep = prev.find((f) => f.url === api);
            if (!ep) return prev;
            return prev.map((f) =>
                f.url === api
                    ? {
                          ...f,
                          savedState: {
                              filters,
                              settings,
                              sidebarWidth,
                              detailWidth,
                          },
                      }
                    : f
            );
        });
    }, [api, filters, settings, sidebarWidth, detailWidth, setEndpoints]);

    const { entries, status, error, pause, resume, clear } = useDataFetcher({
        api: api || "",
        interval: api ? settings.interval : 0,
    });

    const fieldMapping = useMemo(() => {
        if (entries.length > 0) {
            return detectFields(entries[0]);
        }
        return {};
    }, [entries]);

    const filteredEntries = useMemo(() => {
        let result = entries;

        if (filters.statuses.length > 0 && fieldMapping.status) {
            result = result.filter((entry) => {
                const val = entry[fieldMapping.status];
                if (typeof val !== "number") return true;
                const prefix = String(val).charAt(0) + "xx";
                return filters.statuses.includes(prefix);
            });
        }

        if (filters.methods.length > 0 && fieldMapping.method) {
            result = result.filter((entry) => {
                const val = entry[fieldMapping.method];
                if (typeof val !== "string") return true;
                return filters.methods.includes(val.toUpperCase());
            });
        }

        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((entry) => JSON.stringify(entry).toLowerCase().includes(q));
        }

        return result;
    }, [entries, filters, fieldMapping]);

    const togglePin = useCallback(
        (entry: Record<string, unknown>) => {
            const hash = hashEntry(entry);
            setPinnedHashes((prev) => {
                const next = new Set(prev);
                if (next.has(hash)) next.delete(hash);
                else next.add(hash);
                return next;
            });
        },
        [setPinnedHashes]
    );

    const toggleCompare = useCallback(() => {
        setCompareMode((prev) => {
            if (prev) setCompareSelection([]);
            return !prev;
        });
    }, []);

    const handleCompareSelect = useCallback((entry: Record<string, unknown>) => {
        setCompareSelection((prev) => {
            const hash = hashEntry(entry);
            const exists = prev.some((e) => hashEntry(e) === hash);
            if (exists) return prev.filter((e) => hashEntry(e) !== hash);
            if (prev.length >= 2) return prev;
            return [...prev, entry];
        });
    }, []);

    const { pinnedEntries, unpinnedEntries } = useMemo(() => {
        const pinned: Record<string, unknown>[] = [];
        const unpinned: Record<string, unknown>[] = [];
        for (const entry of filteredEntries) {
            if (pinnedHashes.has(hashEntry(entry))) pinned.push(entry);
            else unpinned.push(entry);
        }
        return { pinnedEntries: pinned, unpinnedEntries: unpinned };
    }, [filteredEntries, pinnedHashes]);

    const allDisplayed = useMemo(
        () => [...pinnedEntries, ...unpinnedEntries],
        [pinnedEntries, unpinnedEntries]
    );

    const selectedEntry = useMemo(() => {
        if (!entryParam) return null;
        return allDisplayed.find((e) => hashEntry(e) === entryParam) ?? null;
    }, [entryParam, allDisplayed]);

    const selectedIndex = useMemo(() => {
        if (!selectedEntry) return null;
        return allDisplayed.indexOf(selectedEntry);
    }, [selectedEntry, allDisplayed]);

    const handleSelect = useCallback(
        (index: number) => {
            const entry = allDisplayed[index];
            if (!entry) return;
            const hash = hashEntry(entry);
            const params = new URLSearchParams(searchParams.toString());
            if (params.get("entry") === hash) {
                params.delete("entry");
            } else {
                params.set("entry", hash);
            }
            router.replace(`/monitor?${params.toString()}`, { scroll: false });
        },
        [allDisplayed, searchParams, router]
    );

    const [copied, setCopied] = useState(false);
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("entry");
        router.replace(`/monitor?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    const isPaused = status === "paused";

    const compareHashes = useMemo(
        () => new Set(compareSelection.map(hashEntry)),
        [compareSelection]
    );

    useKeyboardShortcuts(
        useMemo(
            () => ({
                Escape: () => {
                    if (compareMode) {
                        setCompareMode(false);
                        setCompareSelection([]);
                    } else {
                        handleClose();
                    }
                },
                c: () => toggleCompare(),
                j: () => {
                    if (allDisplayed.length === 0) return;
                    const next = Math.min((selectedIndex ?? -1) + 1, allDisplayed.length - 1);
                    handleSelect(next);
                },
                ArrowDown: () => {
                    if (allDisplayed.length === 0) return;
                    const next = Math.min((selectedIndex ?? -1) + 1, allDisplayed.length - 1);
                    handleSelect(next);
                },
                k: () => {
                    if (allDisplayed.length === 0) return;
                    const prev = Math.max((selectedIndex ?? 1) - 1, 0);
                    handleSelect(prev);
                },
                ArrowUp: () => {
                    if (allDisplayed.length === 0) return;
                    const prev = Math.max((selectedIndex ?? 1) - 1, 0);
                    handleSelect(prev);
                },
                " ": () => (isPaused ? resume() : pause()),
                "/": () => searchRef.current?.focus(),
                "?": () => setShortcutsOpen((prev) => !prev),
            }),
            [
                handleClose,
                compareMode,
                toggleCompare,
                allDisplayed.length,
                selectedIndex,
                handleSelect,
                isPaused,
                resume,
                pause,
            ]
        )
    );

    const hostname = (() => {
        if (!api) return null;
        try {
            return new URL(api).hostname;
        } catch {
            return api;
        }
    })();

    const currentEndpoint = endpoints.find((f) => f.url === api);

    const currentState: SavedViewState = {
        filters,
        settings,
        sidebarWidth,
        detailWidth,
    };

    const handleEditEndpoint = (updated: Endpoint) => {
        setEndpoints((prev) => prev.map((f) => (f.url === currentEndpoint!.url ? updated : f)));
    };

    const handleDeleteEndpoint = () => {
        setEndpoints((prev) => prev.filter((f) => f.url !== currentEndpoint!.url));
        router.push("/monitor");
    };

    const sidebarProps = {
        currentApi: api || "",
        endpoints,
        onEndpointsChange: setEndpoints,
        filters,
        onFiltersChange: setFilters,
        settings,
        onSettingsChange: setSettings,
        logs: filteredEntries,
    };

    return (
        <div className="flex min-h-dvh">
            <DesktopSidebar {...sidebarProps} />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b px-4 h-14 flex items-center gap-3">
                    <MobileSidebar {...sidebarProps} />
                    <Link
                        href={hostname ? "/monitor" : "/"}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {hostname ? <Home className="size-4" /> : null}
                    </Link>
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                        {hostname && (
                            <div
                                className={cn(
                                    "size-2 rounded-full shrink-0",
                                    statusDotColor[status]
                                )}
                            />
                        )}
                        <span className="text-sm font-medium">{hostname || t("home")}</span>
                        {hostname && (
                            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline truncate">
                                {api}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={handleCopyLink}
                        >
                            {copied ? (
                                <Check className="size-4 text-status-2xx" />
                            ) : (
                                <Link2 className="size-4" />
                            )}
                        </Button>
                        {currentEndpoint && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setEditDialogOpen(true)}
                            >
                                <Settings2 className="size-4" />
                            </Button>
                        )}
                    </div>
                </header>

                {currentEndpoint && (
                    <EditorDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        endpoint={currentEndpoint}
                        currentState={currentState}
                        onSave={handleEditEndpoint}
                        onDelete={handleDeleteEndpoint}
                    />
                )}

                {!api && (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <Link2 className="size-6" />
                        <p className="text-sm">{t("noEndpoint")}</p>
                        <p className="text-xs">{t("noEndpointHint")}</p>
                    </div>
                )}

                {api && (
                    <>
                        <div className="sticky top-14 z-30 bg-background/80 backdrop-blur-sm px-4 py-3 border-b">
                            <Toolbar
                                filters={filters}
                                onFiltersChange={setFilters}
                                status={status}
                                totalCount={entries.length}
                                interval={settings.interval}
                                onIntervalChange={(v) =>
                                    setSettings((s) => ({ ...s, interval: v }))
                                }
                                onPause={pause}
                                onResume={resume}
                                onClear={clear}
                                logs={filteredEntries}
                                searchRef={searchRef}
                                compareMode={compareMode}
                                onToggleCompare={toggleCompare}
                                soundEnabled={settings.sound}
                                onToggleSound={() =>
                                    setSettings((s) => ({ ...s, sound: !s.sound }))
                                }
                                allLogs={entries}
                            />
                        </div>

                        <div
                            ref={scrollContainerRef}
                            className="flex-1 p-4 overflow-y-auto min-h-0"
                            data-lenis-prevent
                        >
                            {status === "connecting" && (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                    <Loader2 className="size-6 animate-spin" />
                                    <p className="text-sm">{t("connecting")}</p>
                                </div>
                            )}

                            {status === "error" && (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                    <AlertTriangle className="size-6 text-status-4xx" />
                                    <p className="text-sm">{t("fetchError")}</p>
                                    {error && <p className="text-xs">{error}</p>}
                                </div>
                            )}

                            {status !== "connecting" &&
                                status !== "error" &&
                                allDisplayed.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                        <Inbox className="size-6" />
                                        <p className="text-sm">{t("noEntries")}</p>
                                    </div>
                                )}

                            {allDisplayed.length > 0 && (
                                <Timeline
                                    pinnedEntries={pinnedEntries}
                                    unpinnedEntries={unpinnedEntries}
                                    pinnedHashes={pinnedHashes}
                                    onTogglePin={togglePin}
                                    autoScroll={settings.autoScroll}
                                    fieldMapping={fieldMapping}
                                    totalCount={allDisplayed.length}
                                    selectedIndex={selectedIndex ?? undefined}
                                    onSelect={handleSelect}
                                    scrollContainerRef={scrollContainerRef}
                                    compareMode={compareMode}
                                    compareSelection={compareHashes}
                                    onCompareSelect={handleCompareSelect}
                                />
                            )}
                        </div>
                    </>
                )}
                {compareMode && (
                    <div className="sticky bottom-0 z-40 bg-background/90 backdrop-blur-sm border-t px-4 py-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            {td("selected", { count: compareSelection.length })}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                    setCompareMode(false);
                                    setCompareSelection([]);
                                }}
                            >
                                {td("cancel")}
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 text-xs"
                                disabled={compareSelection.length !== 2}
                                onClick={() => setDiffOpen(true)}
                            >
                                {td("compare")}
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {compareSelection.length === 2 && (
                <DiffDialog
                    open={diffOpen}
                    onOpenChange={(open) => {
                        setDiffOpen(open);
                        if (!open) {
                            setCompareMode(false);
                            setCompareSelection([]);
                        }
                    }}
                    entryA={compareSelection[0]}
                    entryB={compareSelection[1]}
                />
            )}

            {selectedEntry && (
                <DetailPanel
                    entry={selectedEntry}
                    fieldMapping={fieldMapping}
                    pinned={pinnedHashes.has(hashEntry(selectedEntry))}
                    onTogglePin={() => togglePin(selectedEntry)}
                    onClose={handleClose}
                />
            )}

            <Notifications
                logs={entries}
                enabled={settings.notifications}
                soundEnabled={settings.sound}
            />

            <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
                <DialogContent className="max-w-sm" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{ts("title")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm">
                        {[
                            ["Esc", ts("escape")],
                            ["J / K", ts("jk")],
                            ["Space", ts("space")],
                            ["/", ts("slash")],
                            ["C", ts("c")],
                            ["?", ts("question")],
                        ].map(([key, desc]) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-muted-foreground">{desc}</span>
                                <kbd className="px-2 py-0.5 rounded bg-muted text-xs font-mono">
                                    {key}
                                </kbd>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ViewerPage() {
    if (config.standalone) redirect("/");

    return (
        <Suspense
            fallback={
                <div className="flex min-h-dvh items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <ViewerContent />
        </Suspense>
    );
}