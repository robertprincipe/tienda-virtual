"use client";

import { BadgePercent, CalendarClock, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { createColumns } from "@/components/coupons/columns";
import { DataTable } from "@/components/coupons/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CouponListItem } from "@/schemas/coupon.schema";
import type { PaginatedCoupons } from "@/types/coupon";
import { useDeleteCoupon } from "@/services/coupons/mutations/coupon.mutation";

interface CouponsIndexProps {
  coupons: PaginatedCoupons;
}

export default function CouponsIndex({ coupons }: CouponsIndexProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<CouponListItem>();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { mutate: deleteCoupon } = useDeleteCoupon();

  const handleDelete = (coupon: CouponListItem) => {
    setSelectedCoupon(coupon);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCoupon) {
      deleteCoupon(selectedCoupon.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedCoupon(undefined);
        },
      });
    }
  };

  const now = new Date();
  const stats = {
    total: coupons.total,
    active: coupons.data.filter((coupon) => coupon.isActive).length,
    upcoming: coupons.data.filter(
      (coupon) => coupon.startsAt && new Date(coupon.startsAt) > now
    ).length,
    expired: coupons.data.filter(
      (coupon) => coupon.endsAt && new Date(coupon.endsAt) < now
    ).length,
  };

  const columns = createColumns(handleDelete);

  const handleSearch = (value: string) => {
    void value;
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cupones</h1>
          <p className="text-muted-foreground">
            Gestiona los códigos promocionales y sus reglas de uso
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/coupons/create">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cupón
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BadgePercent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Cupones registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <BadgePercent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Disponibles ahora</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">Pendientes de iniciar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de cupones</CardTitle>
          <CardDescription>Controla vigencias y límites de uso</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={coupons.data}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por código..."
          />
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar cupón?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará "{selectedCoupon?.code}" y no se podrá revertir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
