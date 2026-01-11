"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CharacterWithCategory } from "@/lib/database.types";

interface CharacterCardProps {
  character: CharacterWithCategory;
  onEdit: (character: CharacterWithCategory) => void;
  onDelete: (id: string) => void;
  index?: number;
}

export function CharacterCard({ character, onEdit, onDelete, index = 0 }: CharacterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        type: "spring",
        stiffness: 200
      }}
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.2 } 
      }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Card className="group overflow-hidden bg-[#141417] border border-[#27272A] hover:border-[#DC2626]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)]">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={character.image_url}
            alt={character.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-transparent to-transparent opacity-60" />
          
          {/* Hover overlay with red tint */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-[#DC2626]/30 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Action buttons */}
          <motion.div 
            className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 bg-[#141417]/90 border border-[#27272A] hover:border-[#DC2626] hover:bg-[#1A1A1F] backdrop-blur-sm"
                onClick={() => onEdit(character)}
              >
                <Pencil className="h-4 w-4 text-[#FAFAFA]" />
              </Button>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                variant="destructive"
                className="h-9 w-9"
                onClick={() => onDelete(character.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Category badge */}
          {character.category && (
            <motion.div 
              className="absolute bottom-3 left-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-[#DC2626] text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                {character.category.name}
              </span>
            </motion.div>
          )}
        </div>
        
        <CardContent className="p-4 bg-[#141417] border-t border-[#27272A]">
          <motion.h3 
            className="font-semibold text-lg truncate text-[#FAFAFA]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.1 }}
          >
            {character.name}
          </motion.h3>
        </CardContent>
      </Card>
    </motion.div>
  );
}
