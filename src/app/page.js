

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


  useEffect(() => {
    const stored = localStorage.getItem("grocery-lists");
    if (stored) {
      setLists(JSON.parse(stored));
    }
  }, []);

  //Removed due to list not loading and moved to the handler.
  // useEffect(() => {
  //   localStorage.setItem("grocery-lists", JSON.stringify(lists));
  // }, [lists]);

  

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
    const updated = lists.filter((list) => list !== name);
    setLists(updated);
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
          <p className="text-gray-600">Start adding items now.</p>

          <div className="flex space-x-2 w-full max-w-full overflow-hidden">
  <Input
    className="flex-1 min-w-0"
    placeholder="Enter list name"
    value={listName}
    onChange={(e) => setListName(e.target.value)}
  />
  <Button onClick={handleCreateList} className="shrink-0">
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
                  <button
                    onClick={() => handleOpenList(list)}
                    className="text-left text-sm font-medium text-blue-600 underline flex-1"
                  >
                    {list}
                  </button>
                  <Button
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

      </Card>
    </main>
  );
}
