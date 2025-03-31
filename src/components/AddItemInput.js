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
    <div className="flex space-x-2">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
      />
      <Button onClick={handleAdd}>
        <Icon className="w-5 h-5" />
      </Button>
    </div>
  );
}
