import { Button } from "@/components/Button";

export default function ListEntry({ name, onOpen, onDelete }) {
  return (
    <div className="flex justify-between items-center bg-white shadow rounded-md p-3 cursor-pointer hover:bg-gray-50 transition">
      <div onClick={onOpen} className="flex-1">
        <span className="text-md font-semibold text-gray-800">{name}</span>
      </div>
      <Button
        variant="danger"
        size="sm"
        onClick={onDelete}
        className="ml-2"
      >
        Delete
      </Button>
    </div>
  );
}
