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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      layout
    >
      <Card className="group overflow-hidden transition-all hover:shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
          <Image
            src={character.image_url}
            alt={character.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Action buttons */}
          <motion.div 
            className="absolute top-3 right-3 flex gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm"
                onClick={() => onEdit(character)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="icon"
                variant="destructive"
                className="h-9 w-9 shadow-lg"
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg">
                {character.category.name}
              </span>
            </motion.div>
          )}
        </div>
        
        <CardContent className="p-4 bg-white/95 backdrop-blur-sm">
          <motion.h3 
            className="font-semibold text-lg truncate text-foreground"
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
