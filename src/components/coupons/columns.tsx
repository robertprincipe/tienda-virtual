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
import type { CouponListItem } from "@/schemas/coupon.schema";

const formatCurrency = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return "-";
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

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const createColumns = (
  onDelete: (coupon: CouponListItem) => void
): ColumnDef<CouponListItem>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Código
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const coupon = row.original;
      return (
        <div className="flex flex-col">
          <Link
            href={`/dashboard/coupons/${coupon.id}`}
            className="font-medium hover:underline"
          >
            {coupon.code}
          </Link>
          <span className="text-xs text-muted-foreground uppercase">
            {coupon.type === "percent" ? "Porcentaje" : "Monto fijo"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Valor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.type === "percent"
          ? `${row.original.value}%`
          : formatCurrency(row.original.value)}
      </span>
    ),
  },
  {
    accessorKey: "minSubtotal",
    header: "Subtotal mínimo",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.minSubtotal ? formatCurrency(row.original.minSubtotal) : "-"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    accessorKey: "startsAt",
    header: "Vigencia",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.original.startsAt ? formatDate(row.original.startsAt) : "Sin inicio"}
        <br />
        {row.original.endsAt ? formatDate(row.original.endsAt) : "Sin vencimiento"}
      </div>
    ),
  },
  {
    accessorKey: "productsCount",
    header: "Productos",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.productsCount ?? 0}</span>
    ),
  },
  {
    accessorKey: "categoriesCount",
    header: "Categorías",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.categoriesCount ?? 0}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const coupon = row.original;
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
                href={`/dashboard/coupons/${coupon.id}`}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/coupons/${coupon.id}/edit`}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(coupon)}
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
