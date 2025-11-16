"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/hooks/stores/cart.store";
import {
  checkPendingCartMigration,
  migrateAnonymousCart,
} from "@/services/cart/actions/cart.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CartInitializer() {
  const { loadCart } = useCartStore();
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationData, setMigrationData] = useState({
    anonymousItemsCount: 0,
    userItemsCount: 0,
  });

  useEffect(() => {
    // Cargar carrito al iniciar
    loadCart();

    // Verificar si hay carrito pendiente de migración
    checkPendingCartMigration().then((data) => {
      if (data.hasPendingMigration) {
        setMigrationData({
          anonymousItemsCount: data.anonymousItemsCount,
          userItemsCount: data.userItemsCount,
        });
        setShowMigrationDialog(true);
      }
    });
  }, [loadCart]);

  const handleMerge = async () => {
    await migrateAnonymousCart(true);
    setShowMigrationDialog(false);
    await loadCart();
  };

  const handleKeepUser = async () => {
    await migrateAnonymousCart(false);
    setShowMigrationDialog(false);
    await loadCart();
  };

  return (
    <AlertDialog
      open={showMigrationDialog}
      onOpenChange={setShowMigrationDialog}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Fusionar carritos</AlertDialogTitle>
          <AlertDialogDescription>
            Tienes productos en tu carrito actual (
            {migrationData.anonymousItemsCount}{" "}
            {migrationData.anonymousItemsCount === 1 ? "producto" : "productos"}
            )
            {migrationData.userItemsCount > 0 && (
              <>
                {" "}
                y en tu carrito de usuario ({migrationData.userItemsCount}{" "}
                {migrationData.userItemsCount === 1 ? "producto" : "productos"})
              </>
            )}
            .
            <br />
            <br />
            ¿Qué deseas hacer?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleKeepUser}>
            Mantener solo mi carrito
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleMerge}>
            Fusionar ambos carritos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
