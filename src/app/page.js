

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import Tabs from "@/components/Tabs";
import { useSetAtom } from "jotai";
import { preventAutoResetAtom } from "@/store/ListRoute";

export default function Home() {
  const [listName, setListName] = useState("");
  const [lists, setLists] = useState([]);
  const router = useRouter();
  const setPreventReset = useSetAtom(preventAutoResetAtom);
  const [listToDelete, setListToDelete] = useState(null);



  useEffect(() => {
    const stored = localStorage.getItem("grocery-lists");
    if (stored) {
      setLists(JSON.parse(stored));
    }
  }, []);



  const handleCreateList = () => {
    const trimmed = listName.trim();
    if (!trimmed || lists.includes(trimmed)) return;
  
    const updatedLists = [...lists, trimmed];
    
    // Save both now, before pushing
    localStorage.setItem("grocery-lists", JSON.stringify(updatedLists));
    localStorage.setItem(
      `grocery-${trimmed}`,
      JSON.stringify({ categories: [], uncategorized: [] })
    );
  
    setLists(updatedLists);
    setListName("");
    router.push(`/list/${encodeURIComponent(trimmed)}`);
  };
  



  const handleDeleteList = (name) => {
    setListToDelete(name); // triggers the confirmation
  };
  
  const confirmDelete = () => {
    if (!listToDelete) return;
  
    // Remove the main entry from the list of names
    const updated = lists.filter((list) => list !== listToDelete);
  
    // Remove the full associated list data from localStorage
    localStorage.removeItem(`grocery-${listToDelete}`);
  
    // Update localStorage list index
    localStorage.setItem("grocery-lists", JSON.stringify(updated));
  
    // Update state
    setLists(updated);
    setListToDelete(null);
  };
  
  
  const cancelDelete = () => {
    setListToDelete(null);
  };
  

  const handleOpenList = (name) => {
    setPreventReset(true); 
    router.push(`/list/${encodeURIComponent(name)}`);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
  <Card className="w-full max-w-md h-screen p-4 space-y-4 overflow-y-auto">
    <Tabs
      tabs={[
        {
          label: "Grocery List",
          content: (
            <>
              <h2 className="text-xl font-bold">Grocery List</h2>
              <p className="text-gray-600">Start by adding a list.</p>

              <div className="flex w-full items-center rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <Input
                  type="text"
                  placeholder="Enter list name"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="flex-1 px-3 py-2 text-base focus:outline-none"
                />
                <Button
                  onClick={handleCreateList}
                  className="bg-green-800 text-white px-4 py-2 text-sm font-medium hover:bg-green-900 focus:outline-none "
                >
                  Add
                </Button>
              </div>

              {lists.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold mt-4">Your Lists</h3>
                  {lists.map((list) => (
                    <div
                      key={list}
                      className="flex justify-between items-center border rounded px-3 py-2"
                    >
                      <Button
                        onClick={() => handleOpenList(list)}
                        className="text-left text-sm font-medium text-white underline flex-1"
                      >
                        {list}
                      </Button>
                      <Button
                        className="bg-slate-400"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteList(list)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ),
        },
        {
          label: "Scan",
          content: (
            <div className="text-center text-gray-500 text-md w-full">
              Scan feature coming soon!
            </div>
          ),
        },
      ]}
    />

    {/* Confirmation Overlay */}
    {/* {listToDelete && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-xl shadow-lg space-y-4 max-w-xs w-full text-center">
          <p className="text-lg font-semibold">
            Delete list "{listToDelete}"?
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, Delete
            </Button>
            <Button variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )} */}
    {listToDelete && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
  >
    <div
      className="bg-white p-4 rounded-xl shadow-lg space-y-4 max-w-xs w-full text-center transform transition-all duration-300 scale-95 opacity-0 animate-dialog-in"
    >
      <p className="text-lg font-semibold">
        Delete list "{listToDelete}"?
      </p>
      <div className="flex justify-center space-x-4">
        <Button variant="destructive" onClick={confirmDelete}>
          Yes, Delete
        </Button>
        <Button variant="secondary" onClick={cancelDelete}>
          Cancel
        </Button>
      </div>
    </div>
  </div>
)}

  </Card>
</main>


  );
}
