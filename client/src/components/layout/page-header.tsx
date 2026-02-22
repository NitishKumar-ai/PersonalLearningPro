import { ReactNode, Fragment } from "react";
import { cn } from "@/lib/utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "wouter";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    className?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, subtitle, children, className, breadcrumbs }: PageHeaderProps) {
    return (
        <div className={cn("mb-8 flex flex-col gap-1", className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb className="mb-2">
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                            <Fragment key={crumb.label}>
                                <BreadcrumbItem>
                                    {index === breadcrumbs.length - 1 || !crumb.href ? (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>
                {children && (
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
