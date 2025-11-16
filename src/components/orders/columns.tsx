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
import type { OrderListItem } from "@/schemas/order.schema";

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
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  created: {
    label: "Creada",
    variant: "secondary",
  },
  paid: {
    label: "Pagada",
    variant: "default",
  },
  processing: {
    label: "Procesando",
    variant: "default",
  },
  shipped: {
    label: "Enviada",
    variant: "default",
  },
  delivered: {
    label: "Entregada",
    variant: "default",
  },
  canceled: {
    label: "Cancelada",
    variant: "outline",
  },
  refunded: {
    label: "Reembolsada",
    variant: "outline",
  },
};

export const createOrderColumns = (
  onDelete: (order: OrderListItem) => void
): ColumnDef<OrderListItem>[] => [
  {
    accessorKey: "publicId",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Orden
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/orders/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.publicId}
      </Link>
    ),
  },
  {
    accessorKey: "user",
    header: "Cliente",
    cell: ({ row }) => {
      const order = row.original;
      if (order.user) {
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{order.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {order.user.email}
            </span>
          </div>
        );
      }

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{order.email}</span>
          <span className="text-xs text-muted-foreground">Invitado</span>
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
        Ítems
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.original.itemsCount}</span>,
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.total)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const meta = statusMeta[row.original.status] ?? statusMeta.created;
      return <Badge variant={meta.variant}>{meta.label}</Badge>;
    },
  },
  {
    accessorKey: "placedAt",
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
        {formatDate(row.original.placedAt as Date | string | null)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const order = row.original;
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
                href={`/dashboard/orders/${order.id}`}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/orders/${order.id}/edit`}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(order)}
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
