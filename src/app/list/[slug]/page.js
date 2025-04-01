"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/Accordion";
import {ArrowLeft, CheckCircle, Circle } from "lucide-react";
import AddItemInput from "@/components/AddItemInput";
import {
    SwipeableList,
    SwipeableListItem,
    LeadingActions,
    TrailingActions,
    SwipeAction,
  } from "react-swipeable-list";
  import "react-swipeable-list/dist/styles.css";
  import { useAtom } from "jotai";
import { preventAutoResetAtom } from "@/store/ListRoute";
  

export default function ListPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const [preventReset, setPreventReset] = useAtom(preventAutoResetAtom);
 

  const [listData, setListData] = useState({
    categories: [],
    uncategorized: [],
  });
  const [hasMounted, setHasMounted] = useState(false);
 
  const dataWasLoaded = useRef(false);
  
  
  const hasLoaded = useRef(false);
  const isFirstRender = useRef(true);
  

  const deleteUncategorizedItem = (index) => {
    const updated = [...listData.uncategorized];
    updated.splice(index, 1);
    setListData({ ...listData, uncategorized: updated });
  };
  
  const deleteCategoryItem = (categoryIndex, itemIndex) => {
    const updated = [...listData.categories];
    updated[categoryIndex].items.splice(itemIndex, 1);
    setListData({ ...listData, categories: updated });
  };
  
// The one useEffect to rule them all
useEffect(() => {
    if (!slug) return;
  
    const key = `grocery-${slug}`;
  
    // ⛔ Don't try to load or save multiple times
    if (dataWasLoaded.current) {
      // ✅ If user has changed data after initial load, save it
      if (hasMounted) {
        localStorage.setItem(key, JSON.stringify(listData));
      }
      return;
    }
  
    // ✅ First time loading the data
    const stored = localStorage.getItem(key);
  
    if (stored) {
      setListData(JSON.parse(stored));
    } else if (!preventReset) {
      const initial = { categories: [], uncategorized: [] };
      setListData(initial);
      localStorage.setItem(key, JSON.stringify(initial));
    }
  
    setPreventReset(false); // clear the atom after use
    dataWasLoaded.current = true;
    setHasMounted(true); // allow future saves
  }, [listData, slug]);
  

  

  const addItemToCategory = (index, item) => {
    if (!item.trim()) return;
    const updated = [...listData.categories];
    updated[index].items.push({ name: item, checked: false });
    setListData({ ...listData, categories: updated });
  };

  const addItemUncategorized = (item) => {
    if (!item.trim()) return;
    const updated = [...listData.uncategorized, { name: item, checked: false }];
    setListData({ ...listData, uncategorized: updated });
  };

  const toggleItem = (categoryIndex, itemIndex, isUncategorized = false) => {
    const updated = { ...listData };

    if (isUncategorized) {
      updated.uncategorized[itemIndex].checked =
        !updated.uncategorized[itemIndex].checked;
    } else {
      updated.categories[categoryIndex].items[itemIndex].checked =
        !updated.categories[categoryIndex].items[itemIndex].checked;
    }

    setListData(updated);
  };

  const addCategory = (val) => {
    if (!val.trim()) return;
    setListData({
      ...listData,
      categories: [...listData.categories, { name: val, items: [] }],
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
 <div className="flex items-center justify-between">
 <Button
        variant="secondary"
        className="w-half mt-4"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="w-12 h-10" />
        Back
      </Button>
      <h2 className="text-xl font-bold p-2">List: {decodeURIComponent(slug)}</h2>
 </div>

      <AddItemInput
      className="text-base"
        placeholder="New category"
        onAdd={addCategory}
        icon="folder"
      />

<SwipeableList>
  {listData.uncategorized.map((item, index) => (
    <SwipeableListItem
      key={index}
      trailingActions={
        <TrailingActions>
          <SwipeAction
            destructive
            onClick={() => deleteUncategorizedItem(index)}
          >
            Delete
          </SwipeAction>
        </TrailingActions>
      }
    >
      <li
        onClick={() => toggleItem(null, index, true)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border-b cursor-pointer"
      >
        {item.checked ? (
          <CheckCircle className="text-green-600 w-6 h-6" />
        ) : (
          <Circle className="text-gray-400 w-6 h-6" />
        )}
        <span
          className={`text-lg ${
            item.checked ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {item.name}
        </span>
      </li>
    </SwipeableListItem>
  ))}
</SwipeableList>

      <AddItemInput
      className="text-base"
        placeholder="Add item without category"
        onAdd={addItemUncategorized}
      />
<Accordion type="multiple" className="w-full">
  {listData.categories.map((category, index) => (
    <AccordionItem key={category.name} value={category.name}>
      <AccordionTrigger>{category.name}</AccordionTrigger>
      <AccordionContent>
        <SwipeableList>
          {category.items.map((item, i) => (
            <SwipeableListItem
              key={i}
              trailingActions={
                <TrailingActions>
                  <SwipeAction
                    destructive
                    onClick={() => deleteCategoryItem(index, i)}
                  >
                    Delete
                  </SwipeAction>
                </TrailingActions>
              }
            >
              <li
                onClick={() => toggleItem(index, i)}
                className="flex items-center space-x-2 px-3 py-2 bg-white border-b cursor-pointer"
              >
                {item.checked ? (
                  <CheckCircle className="text-green-600 w-6 h-6" />
                ) : (
                  <Circle className="text-gray-400 w-6 h-6" />
                )}
                <span
                  className={`text-lg ${
                    item.checked
                      ? "line-through text-gray-400"
                      : "text-gray-800"
                  }`}
                >
                  {item.name}
                </span>
              </li>
            </SwipeableListItem>
          ))}
        </SwipeableList>

        <AddItemInput
          className="text-base"
          placeholder={`Add item to ${category.name}`}
          onAdd={(item) => addItemToCategory(index, item)}
        />
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>

     

 
    </div>
  );
}

