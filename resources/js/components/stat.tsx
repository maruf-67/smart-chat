interface StatProps {
    label: string;
    value: string | number;
    description: string;
}

export function Stat({ label, value, description }: StatProps) {
    return (
        <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:scale-105 hover:shadow-lg dark:border-border">
            <p className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
    );
}
