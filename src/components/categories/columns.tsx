import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { SelectCategory } from "@/schemas/category.schema";

export const createColumns = (
  onDelete: (category: SelectCategory) => void
): ColumnDef<SelectCategory>[] => [
  {
    accessorKey: "image_url",
    header: "Imagen",
    cell: ({ row }) => {
      const category = row.original;
      return category.imageUrl ? (
        <img
          src={category.imageUrl}
          alt={category.name}
          className="h-12 w-12 rounded object-cover"
        />
      ) : (
        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">N/A</span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div>
          <Link
            href={`/dashboard/categories/${category.id}`}
            className="font-medium hover:underline"
          >
            {category.name}
          </Link>
          <div className="text-sm text-muted-foreground">{category.slug}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "parent",
    header: "Categoría Padre",
    cell: ({ row }) => {
      const parent = row.original.parent;
      return parent ? (
        <Link
          href={`/dashboard/categories/${parent.id}`}
          className="text-sm hover:underline"
        >
          {parent.name}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "products_count",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Productos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.original.productsCount || 0;
      return <span className="text-sm">{count}</span>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Creación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt || "");
      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-PE", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/categories/${category.id}`}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/categories/${category.id}/edit`}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
