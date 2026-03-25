"use client";

import { Button } from "@/components/ui/button";
import type { ViewEndpoint } from "@/data/views";

interface SelectorProps {
    endpoints: ViewEndpoint[];
    activeIndex: number;
    onChange: (index: number) => void;
}

/**
 * Button group for switching between multiple API endpoints.
 * Only renders when there are 2 or more endpoints to choose from.
 *
 * @param props.endpoints - List of available endpoints
 * @param props.activeIndex - Index of the currently active endpoint
 * @param props.onChange - Callback when a different endpoint is selected
 */
export default function Selector({ endpoints, activeIndex, onChange }: SelectorProps) {
    if (endpoints.length < 2) return null;

    return (
        <div className="flex items-center gap-1">
            {endpoints.map((ep, i) => (
                <Button
                    key={ep.url}
                    variant={i === activeIndex ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => onChange(i)}
                >
                    {ep.name}
                </Button>
            ))}
        </div>
    );
}