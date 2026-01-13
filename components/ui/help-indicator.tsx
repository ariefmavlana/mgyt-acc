"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface HelpIndicatorProps {
    content: React.ReactNode
    className?: string
}

export function HelpIndicator({ content, className }: HelpIndicatorProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <CircleHelp className={cn("h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors", className)} />
                </TooltipTrigger>
                <TooltipContent>
                    <div className="max-w-[300px] text-xs">
                        {content}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
