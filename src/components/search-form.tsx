import { Search } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { SidebarInput } from '@/components/ui/sidebar';
import { cn } from '@/lib/uitils';

export function SearchForm({
  inputClassName,
  iconWrapperClassName,
  ...props
}: React.ComponentProps<'form'> & {
  inputClassName?: string;
  iconWrapperClassName?: string;
}) {
  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Type to search..."
          className={cn('min-h-8 pl-7', inputClassName)}
        />
        <div
          className={cn(
            'absolute size-4 h-full w-7 top-0 rounded-l-md',
            iconWrapperClassName
          )}
        >
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none " />
        </div>
      </div>
    </form>
  );
}
