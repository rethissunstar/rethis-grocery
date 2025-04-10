

'use client';

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ScannedItemSheet({ open, onClose, item, side = "top" }) {
  const [listKeys, setListKeys] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState(["uncategorized"]);
  const [category, setCategory] = useState("uncategorized");

  const [newListName, setNewListName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("grocery-")
    );
    setListKeys(keys);
  }, []);

  useEffect(() => {
    if (!selectedList) return;

    const stored = localStorage.getItem(selectedList);
    if (!stored) return;

    const list = JSON.parse(stored);
    const categoryNames = list.categories?.map((c) => c.name) || [];
    setCategoryOptions(["uncategorized", ...categoryNames]);
  }, [selectedList]);

  if (!item) return null;

  const {
    title,
    brand,
    images,
    lowest_recorded_price,
    highest_recorded_price,
    ean,
  } = item;

  const priceDisplay =
    lowest_recorded_price === highest_recorded_price
      ? `$${lowest_recorded_price}`
      : `$${lowest_recorded_price} - $${highest_recorded_price}`;

  const handleAdd = () => {
    if (!selectedList) return;

    const stored = localStorage.getItem(selectedList);
    if (!stored) return;

    const list = JSON.parse(stored);

    const newItem = {
      name: title,
      ean,
      brand,
      checked: false,
    };

    if (category === "uncategorized") {
      list.uncategorized = Array.isArray(list.uncategorized) ? list.uncategorized : [];
      list.uncategorized.push(newItem); // ✅ using array
    } else {
      let cat = list.categories.find((c) => c.name === category);
      if (!cat) {
        cat = { name: category, items: [] };
        list.categories.push(cat);
      }
      cat.items.push(newItem);
    }

    localStorage.setItem(selectedList, JSON.stringify(list));
    onClose(false);
  };

  const handleNewList = () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;

    const key = `grocery-${trimmed}`;
    if (localStorage.getItem(key)) {
      alert("List already exists.");
      return;
    }

    const newList = {
      categories: [],
      uncategorized: [],
    };

    localStorage.setItem(key, JSON.stringify(newList));

    // Update master list index: grocery-lists
    const listNames = JSON.parse(localStorage.getItem("grocery-lists") || "[]");
    if (!listNames.includes(trimmed)) {
      listNames.push(trimmed);
      localStorage.setItem("grocery-lists", JSON.stringify(listNames));
    }
    
    setListKeys((prev) => [...prev, key]);
    
    setSelectedList(key);
    setCategory("uncategorized");
    setNewListName("");
  };

  const handleNewCategory = () => {
    if (!selectedList || !newCategoryName.trim()) return;

    const stored = localStorage.getItem(selectedList);
    if (!stored) return;

    const list = JSON.parse(stored);

    const exists = list.categories.some((c) => c.name === newCategoryName.trim());
    if (exists) {
      alert("Category already exists.");
      return;
    }

    list.categories.push({ name: newCategoryName.trim(), items: [] });
    localStorage.setItem(selectedList, JSON.stringify(list));
    setCategoryOptions((prev) => [...prev, newCategoryName.trim()]);
    setCategory(newCategoryName.trim());
    setNewCategoryName("");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side={side} className="p-4 max-w-md mx-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="text-gray-600">
            {brand} — {priceDisplay}
          </SheetDescription>
        </SheetHeader>

        {images?.[0] && (
          <img
            src={images[0]}
            alt={title}
            className="mt-4 mx-auto max-h-40 rounded shadow"
          />
        )}

        <div className="mt-4 space-y-4">
          {/* List selector + new list input */}
          <Select onValueChange={(val) => setSelectedList(val)} value={selectedList}>
            <SelectTrigger>
              <SelectValue placeholder="Select List" />
            </SelectTrigger>
            <SelectContent>
              {listKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {key.replace("grocery-", "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full">
  <Input
    type="text"
    placeholder="New list name"
    value={newListName}
    onChange={(e) => setNewListName(e.target.value)}
    className="w-full pr-[4.5rem] text-base"
  />
  <Button
    onClick={handleNewList}
    className="absolute top-1 right-1 h-[calc(100%-0.5rem)] px-4 text-sm bg-green-800 hover:bg-green-900"
  >
    Add
  </Button>
</div>



          {/* Category selector + new category input */}
          <Select
            onValueChange={(val) => setCategory(val)}
            value={category}
            disabled={!selectedList}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full">
  <Input
    value={newCategoryName}
    onChange={(e) => setNewCategoryName(e.target.value)}
    placeholder="New category name"
    disabled={!selectedList}
    className="w-full pr-[7rem] text-base" // space for longer button
  />
  <Button
    onClick={handleNewCategory}
    disabled={!selectedList}
    className="absolute top-1 right-1 h-[calc(100%-0.5rem)] px-3 text-sm bg-green-800 hover:bg-green-900"
  >
    Add Category
  </Button>
</div>


          <Button onClick={handleAdd} disabled={!selectedList}>
            Add to List
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
