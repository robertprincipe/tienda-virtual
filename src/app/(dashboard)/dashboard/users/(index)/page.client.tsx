"use client";

import { Mail, Plus, User2 } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

import { createUserColumns } from "@/components/users/columns";
import { DataTable } from "@/components/users/data-table";
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
import type { UserListItem } from "@/schemas/admin-user.schema";
import type { PaginatedUsers } from "@/types/user";
import { useDeleteUser } from "@/services/users/mutations/admin-user.mutation";

interface UsersIndexProps {
  usersPromise: Promise<PaginatedUsers>;
}

export default function UsersIndex({ usersPromise }: UsersIndexProps) {
  const users = React.use(usersPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchValue, 500);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem>();

  const { mutate: deleteUser } = useDeleteUser();

  const handleDelete = (user: UserListItem) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedUser(undefined);
        },
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    const newUrl = `/dashboard/users?${params.toString()}`;
    const currentUrl = `/dashboard/users?${searchParams.toString()}`;

    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [debouncedSearch, router, searchParams]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const stats = useMemo(() => {
    const total = users.result.total;
    const admins = users.result.data.filter((u) => u.roleId === 1).length;
    const managers = users.result.data.filter((u) => u.roleId === 2).length;
    return { total, admins, managers };
  }, [users]);

  const columns = createUserColumns(handleDelete);

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los accesos y perfiles del equipo
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/users/create">
            <Plus className="mr-2 h-4 w-4" /> Nuevo usuario
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <User2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administradores
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Rol ID 1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestores</CardTitle>
            <User2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.managers}</div>
            <p className="text-xs text-muted-foreground">Rol ID 2</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de usuarios</CardTitle>
          <CardDescription>
            Controla roles, contactos y permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users.result.data}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por nombre o correo..."
            pageCount={users.result.pageCount}
            currentPage={users.result.currentPage}
          />
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar usuario?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el usuario &quot;{selectedUser?.email}
              &quot;.
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
