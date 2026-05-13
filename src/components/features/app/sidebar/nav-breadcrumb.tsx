"use client";

import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCollections } from "@/services/features/collections/hooks/use-collections";

export function NavBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const { data: collections } = useCollections();

  const getSegmentLabel = (segment: string, index: number) => {
    // Check if previous segment is "collections" and current segment is UUID
    const prevSegment = segments[index];
    if (prevSegment === "collections" && collections) {
      const collection = collections.find((c) => c.id === segment);
      if (collection) {
        return collection.name;
      }
    }

    // Default: capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          {segments.length === 1 ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href="/app">Dashboard</BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {segments.length > 1 && <BreadcrumbSeparator />}
        {segments.slice(1).map((segment, index) => {
          const href = `/${segments.slice(0, index + 2).join("/")}`;
          const isLast = index === segments.length - 2;
          const label = getSegmentLabel(segment, index);

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
