"use client";

import { motion } from "framer-motion";
import { CharacterCard } from "./character-card";
import type { CharacterWithCategory } from "@/lib/database.types";
import { Sparkles } from "lucide-react";

interface CharacterGridProps {
  characters: CharacterWithCategory[];
  onEdit: (character: CharacterWithCategory) => void;
  onDelete: (id: string) => void;
}

export function CharacterGrid({ characters, onEdit, onDelete }: CharacterGridProps) {
  if (characters.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-6"
        >
          <Sparkles className="h-16 w-16 text-primary" />
        </motion.div>
        <motion.h3 
          className="text-2xl font-semibold mb-2 text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          No characters yet
        </motion.h3>
        <motion.p 
          className="text-muted-foreground mb-4 max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Click the <span className="font-semibold text-primary">"Add Character"</span> button to create your first character
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {characters.map((character, index) => (
        <CharacterCard
          key={character.id}
          character={character}
          onEdit={onEdit}
          onDelete={onDelete}
          index={index}
        />
      ))}
    </div>
  );
}
