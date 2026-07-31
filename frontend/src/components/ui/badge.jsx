import { cn } from '../../lib/utils';

function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand',
        className
      )}
      {...props}
    />
  );
}

export { Badge };
