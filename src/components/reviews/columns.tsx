import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

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
import type { ReviewListItem } from "@/schemas/product-review.schema";

const formatDate = (value?: Date | string | null) => {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const createReviewColumns = (
  onDelete: (review: ReviewListItem) => void
): ColumnDef<ReviewListItem>[] => [
  {
    accessorKey: "product",
    header: "Producto",
    cell: ({ row }) => {
      const product = row.original.product;
      if (!product) {
        return (
          <span className="text-sm text-muted-foreground">
            Producto eliminado
          </span>
        );
      }

      return (
        <Link
          href={`/dashboard/products/${product.id}`}
          className="font-medium hover:underline"
        >
          {product.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "user",
    header: "Cliente",
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return <span className="text-sm text-muted-foreground">Anónimo</span>;
      }

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {user.name ?? "Sin nombre"}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Calificación
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {Number(row.original.rating).toFixed(1)}
      </span>
    ),
  },
  {
    accessorKey: "isApproved",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.isApproved ? "default" : "secondary"}>
        {row.original.isApproved ? "Aprobada" : "Pendiente"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.createdAt as Date | string | null)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const review = row.original;
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
                href={`/dashboard/reviews/${review.id}`}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/reviews/${review.id}/edit`}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(review)}
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
