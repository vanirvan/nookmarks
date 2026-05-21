"use client";

import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Tag {
  id: string;
  title: string;
  fullPath: string;
}

interface TagMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableTags: Tag[];
}

export function TagMultiSelect({
  value,
  onChange,
  availableTags,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const selectedTags = value
    .map((v) => {
      if (v.startsWith("create:")) {
        return { id: v, fullPath: v.replace("create:", ""), isNew: true };
      }
      const tag = availableTags.find((t) => t.id === v);
      return tag ? { ...tag, isNew: false } : null;
    })
    .filter(Boolean) as Array<{ id: string; fullPath: string; isNew: boolean }>;

  const handleSelect = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((v) => v !== tagId));
    } else {
      onChange([...value, tagId]);
    }
    setOpen(false);
  };

  const handleCreate = () => {
    if (inputValue.trim()) {
      const newTag = `create:${inputValue.trim()}`;
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue("");
      setOpen(false);
    }
  };

  const handleRemove = (tagId: string) => {
    onChange(value.filter((v) => v !== tagId));
  };

  const filteredTags = availableTags.filter(
    (tag) =>
      !value.includes(tag.id) &&
      tag.fullPath.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showCreateOption = inputValue.trim() && filteredTags.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant={tag.isNew ? "secondary" : "default"}>
            {tag.isNew && <Plus className="h-3 w-3 shrink-0" />}
            <span className="truncate">{tag.fullPath}</span>
            <button
              type="button"
              onClick={() => handleRemove(tag.id)}
              className="shrink-0 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={
          <Button variant="outline" className="w-full justify-start">
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add tags...</span>
          </Button>
        }>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create tags with /"
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              {showCreateOption ? (
                <CommandEmpty>
                  <div className="p-2">
                    <p className="text-sm text-muted-foreground">
                      No tags found. Create &quot;{inputValue}&quot;?
                    </p>
                    <Button
                      size="sm"
                      onClick={handleCreate}
                      className="w-full"
                    >
                      <Plus className="h-3 w-3 shrink-0" />
                      <span>Create Tag</span>
                    </Button>
                  </div>
                </CommandEmpty>
              ) : (
                <>
                  {filteredTags.length === 0 && !inputValue && (
                    <CommandEmpty>No tags available</CommandEmpty>
                  )}
                  {filteredTags.length === 0 && inputValue && (
                    <CommandEmpty>
                      <div className="p-2">
                        <p className="text-sm text-muted-foreground">
                          No tags found. Create &quot;{inputValue}&quot;?
                        </p>
                        <Button
                          size="sm"
                          onClick={handleCreate}
                          className="w-full"
                        >
                          <Plus className="h-3 w-3 shrink-0" />
                          <span>Create Tag</span>
                        </Button>
                      </div>
                    </CommandEmpty>
                  )}
                  <CommandGroup>
                    {filteredTags.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => handleSelect(tag.id)}
                      >
                        <Check
                          className={`h-4 w-4 shrink-0 ${
                            value.includes(tag.id) ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <span className="truncate">{tag.fullPath}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
