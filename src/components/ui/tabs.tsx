"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn("flex flex-col gap-3", className)} {...props} />
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-9 items-center gap-px border-b border-dsa-border text-dsa-muted",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative inline-flex h-11 items-center justify-center whitespace-nowrap px-3 text-[13px] font-medium tracking-tight transition-colors md:h-9",
        "text-dsa-muted hover:text-dsa-text",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dsa-primary-container/40",
        "data-[state=active]:text-dsa-text-strong",
        "after:absolute after:inset-x-2 after:-bottom-px after:h-px after:bg-transparent data-[state=active]:after:bg-dsa-primary-container",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-dsa-primary-container/45",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
