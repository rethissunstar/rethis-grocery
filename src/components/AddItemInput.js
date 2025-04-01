import { useRef } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Plus, FolderPlus } from "lucide-react";

export default function AddItemInput({
  placeholder,
  onAdd,
  icon = "plus", // "plus" or "folder"
}) {
  const inputRef = useRef();

  const handleAdd = () => {
    const value = inputRef.current?.value.trim();
    if (value) {
      onAdd(value);
      inputRef.current.value = "";
    }
  };

  const Icon = icon === "folder" ? FolderPlus : Plus;

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
        className="pr-12 text-base" 
      />
      <Button
        type="button"
        onClick={handleAdd}
        className="absolute top-1/2 right-2 -translate-y-1/2 h-8 px-2 py-1 text-sm"
      >
        <Icon className="w-8 h-4" />
      </Button>
    </div>
  );
}
