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
import type { CartListItem } from "@/schemas/cart.schema";

const formatCurrency = (value?: string | null) => {
  if (!value) {
    return "S/.0.00";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "S/.0.00";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(numericValue);
};

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

const statusMeta: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline";
  }
> = {
  active: {
    label: "Activo",
    variant: "default",
  },
  converted: {
    label: "Convertido",
    variant: "secondary",
  },
  abandoned: {
    label: "Abandonado",
    variant: "outline",
  },
};

export const createCartColumns = (
  onDelete: (cart: CartListItem) => void
): ColumnDef<CartListItem>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/carts/${row.original.id}`}
        className="font-medium hover:underline"
      >
        #{row.original.id}
      </Link>
    ),
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
    accessorKey: "itemsCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Productos
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.itemsCount} ítem(s)
        <span className="ml-2 text-xs text-muted-foreground">
          {row.original.totalQuantity} unidades
        </span>
      </div>
    ),
  },
  {
    accessorKey: "totalValue",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Subtotal
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatCurrency(row.original.totalValue)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const meta = statusMeta[row.original.status] ?? statusMeta.active;
      return <Badge variant={meta.variant}>{meta.label}</Badge>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Actualizado
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.updatedAt as Date | string | null)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const cart = row.original;
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
                href={`/dashboard/carts/${cart.id}`}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/carts/${cart.id}/edit`}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(cart)}
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
