interface EmptyStateProps {
  message: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
}

export function EmptyState({ message, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-muted-foreground/40">{icon}</div>}
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-medium text-primary hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
