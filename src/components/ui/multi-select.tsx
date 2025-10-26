"use client";

import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import * as React from "react";

type MultiSelectProps = SelectPrimitive.SelectProps & {
  selectedItems?: string[];
};

const MultiSelect = (props: MultiSelectProps) => {
  const { selectedItems = [], ...rest } = props;
  return (
    <SelectPrimitive.Root
      key={selectedItems.join(",")}
      value={undefined}
      {...rest}
    />
  );
};
MultiSelect.displayName = SelectPrimitive.Root.displayName;

const MultiSelectGroup = SelectPrimitive.Group;

const MultiSelectValue = SelectPrimitive.Value;

const MultiSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    selectedItems?: string[];
    onRemoveItem?: (value: string) => void;
  }
>(
  (
    { className, children, selectedItems = [], onRemoveItem, ...props },
    ref
  ) => {
    const [isRemoving, setIsRemoving] = React.useState(false);

    const handleRemoveItem = (item: string) => {
      // console.log("X button clicked for item:", item);
      // console.log("Current selectedItems:", selectedItems);
      setIsRemoving(true);
      // console.log("About to call onRemoveItem with:", item);
      onRemoveItem?.(item);
      // console.log("onRemoveItem called successfully");
      // Reset after a short delay
      setTimeout(() => setIsRemoving(false), 100);
    };

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex h-auto min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onPointerDown={(e) => {
          if (isRemoving) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          props.onPointerDown?.(e);
        }}
        onClick={(e) => {
          if (isRemoving) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          props.onClick?.(e);
        }}
        {...props}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedItems.length > 0 ? (
            selectedItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs"
              >
                {item}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    handleRemoveItem(item);
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  className="ml-1 rounded-full z-30 p-0.5 outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted-foreground/20"
                  title={`Remove ${item}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">Select options...</span>
          )}
        </div>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  }
);
MultiSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const MultiSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
MultiSelectScrollUpButton.displayName =
  SelectPrimitive.ScrollUpButton.displayName;

const MultiSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
MultiSelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const MultiSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <MultiSelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <MultiSelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
MultiSelectContent.displayName = SelectPrimitive.Content.displayName;

const MultiSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
MultiSelectLabel.displayName = SelectPrimitive.Label.displayName;

const MultiSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
MultiSelectItem.displayName = SelectPrimitive.Item.displayName;

const MultiSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
MultiSelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectLabel,
  MultiSelectScrollDownButton,
  MultiSelectScrollUpButton,
  MultiSelectSeparator,
  MultiSelectTrigger,
  MultiSelectValue,
};
