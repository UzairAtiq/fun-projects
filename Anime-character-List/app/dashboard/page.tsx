"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Folder, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterGrid } from "@/components/character-grid";
import { AddCharacterModal } from "@/components/add-character-modal";
import { EditCharacterModal } from "@/components/edit-character-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCharacters, deleteCharacter } from "@/app/actions/characters";
import { getCategories, createCategory } from "@/app/actions/categories";
import type { Category, CharacterWithCategory } from "@/lib/database.types";

export default function DashboardPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [characters, setCharacters] = useState<CharacterWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<CharacterWithCategory | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [charactersData, categoriesData] = await Promise.all([
        getCharacters(),
        getCategories(),
      ]);
      setCharacters(charactersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (character: CharacterWithCategory) => {
    setEditingCharacter(character);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to dismiss this warrior?")) return;

    try {
      await deleteCharacter(id);
      startTransition(() => {
        router.refresh();
        loadData();
      });
    } catch (error) {
      console.error("Failed to delete character:", error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      await createCategory(newCategoryName);
      setNewCategoryName("");
      setCategoryModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create category:", error);
      alert(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="h-12 w-12 border-4 border-[#DC2626] border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[#71717A]">Gathering warriors...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      <motion.header 
        className="sticky top-0 z-10 border-b border-[#27272A] bg-[#0D0D0F]/90 backdrop-blur-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 rounded-lg bg-[#DC2626]/20 border border-[#DC2626]/30"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Swords className="h-6 w-6 text-[#DC2626]" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA]">
                    Warrior Gallery
                  </h1>
                  <p className="text-sm text-[#71717A] mt-0.5">
                    {characters.length} warrior{characters.length !== 1 ? "s" : ""} in your dojo
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="gap-2">
                      <Folder className="h-4 w-4" />
                      <span className="hidden sm:inline">Categories</span>
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border border-[#27272A] bg-[#141417] shadow-[0_0_50px_rgba(220,38,38,0.15)]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-[#FAFAFA]">Manage Categories</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5">
                    <form onSubmit={handleCreateCategory} className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="category-name" className="text-sm font-medium text-[#FAFAFA]">New Category</Label>
                        <div className="flex gap-2">
                          <Input
                            id="category-name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                            className="flex-1 bg-[#0D0D0F] border-[#27272A] text-[#FAFAFA] placeholder:text-[#71717A] focus:border-[#DC2626]"
                          />
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button type="submit" size="icon" className="shrink-0">
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </form>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-[#FAFAFA]">Existing Categories</Label>
                      <AnimatePresence mode="popLayout">
                        {categories.length === 0 ? (
                          <motion.p 
                            className="text-sm text-[#71717A] py-8 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            No categories yet
                          </motion.p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {categories.map((category, index) => (
                              <motion.div
                                key={category.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: index * 0.05 }}
                                className="text-sm py-2.5 px-4 rounded-lg bg-[#27272A] border border-[#3F3F46] text-[#FAFAFA] font-medium"
                              >
                                {category.name}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <motion.main 
        className="container mx-auto px-4 sm:px-6 py-8 sm:py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA]">Your Warriors</h2>
            <p className="text-[#71717A] mt-1.5 text-sm sm:text-base">Manage your elite collection</p>
          </motion.div>
          <AddCharacterModal categories={categories} />
        </div>

        <CharacterGrid
          characters={characters}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </motion.main>

      <EditCharacterModal
        character={editingCharacter}
        categories={categories}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) {
            setEditingCharacter(null);
            loadData();
          }
        }}
      />
    </div>
  );
}
