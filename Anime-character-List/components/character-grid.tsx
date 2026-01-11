"use client";

import { motion } from "framer-motion";
import { CharacterCard } from "./character-card";
import type { CharacterWithCategory } from "@/lib/database.types";
import { Swords } from "lucide-react";

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
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-6 p-6 rounded-lg bg-[#141417] border border-[#27272A]"
        >
          <Swords className="h-16 w-16 text-[#DC2626]" />
        </motion.div>
        <motion.h3 
          className="text-2xl font-semibold mb-2 text-[#FAFAFA]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          No warriors yet
        </motion.h3>
        <motion.p 
          className="text-[#71717A] mb-4 max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Click <span className="font-semibold text-[#DC2626]">"Add Character"</span> to summon your first warrior
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
