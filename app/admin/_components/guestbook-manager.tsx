"use client";

import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteGuestbookEntries } from "@/app/actions/guestbook";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GuestbookEntry {
  id: string;
  name: string | null;
  message: string;
  createdAt: Date;
}

interface GuestbookManagerProps {
  entries: GuestbookEntry[];
}

export function GuestbookManager({ entries }: GuestbookManagerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map((e) => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const result = await deleteGuestbookEntries(selectedIds);
      if (result.success) {
        toast.success("Firmas eliminadas correctamente");
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error("Error al eliminar las firmas");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 size-4" />
            Firmas
          </Button>
        }
      />
      <DialogContent className="flex h-[80vh] flex-col md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gestionar Firmas ({entries.length})</DialogTitle>
          <DialogDescription>
            Selecciona las firmas que deseas eliminar del libro de visitas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between border-b py-4">
          <div className="text-muted-foreground text-sm">
            {selectedIds.length} seleccionadas
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={selectedIds.length === 0 || isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-4" />
            )}
            {isPending ? "Eliminando..." : "Eliminar seleccionadas"}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      entries.length > 0 &&
                      selectedIds.length === entries.length
                    }
                    onCheckedChange={toggleSelectAll}
                    disabled={entries.length === 0}
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead className="w-[150px] text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay firmas en el libro de visitas.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(entry.id)}
                        onCheckedChange={() => toggleSelect(entry.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {entry.name || (
                        <span className="text-muted-foreground italic">
                          Anónimo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <p className="truncate" title={entry.message}>
                        {entry.message}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-muted-foreground text-xs">
                      {new Date(entry.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
