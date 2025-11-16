# Sistema de Carrito de Compras

Sistema completo de carrito de compras con soporte para usuarios autenticados y anónimos, usando Zustand, cookies y sincronización con base de datos.

## Características

✅ Carrito para usuarios autenticados y anónimos
✅ Persistencia en base de datos
✅ Sincronización automática
✅ Migración de carrito anónimo al iniciar sesión
✅ Validación de stock en tiempo real
✅ Actualizaciones optimistas en UI
✅ Manejo de errores robusto

## Instalación

### 1. Agregar el inicializador en el layout raíz

En tu archivo `src/app/layout.tsx` o `src/app/(lobby)/layout.tsx`:

\`\`\`tsx
import { CartInitializer } from "@/components/cart/cart-initializer";

export default function RootLayout({ children }) {
return (
<html>
<body>
<CartInitializer />
{children}
</body>
</html>
);
}
\`\`\`

### 2. El CartSheet ya está configurado

El componente `Cart` en `src/app/(lobby)/_layout/cart.tsx` ya está actualizado para usar el nuevo store.

## Uso

### Agregar productos al carrito

#### Opción 1: Botón simple

\`\`\`tsx
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

<AddToCartButton productId={1} quantity={1} />
\`\`\`

#### Opción 2: Con selector de cantidad

\`\`\`tsx
import { ProductAddToCart } from "@/components/cart/add-to-cart-button";

<ProductAddToCart productId={1} stock={10} />
\`\`\`

#### Opción 3: Uso directo del store

\`\`\`tsx
"use client";

import { useCartStore } from "@/hooks/stores/cart.store";

function MyComponent() {
const { addItem, loading } = useCartStore();

const handleAddToCart = async () => {
const success = await addItem(productId, quantity);
if (success) {
// Producto agregado exitosamente
// El CartSheet se abre automáticamente
}
};

return (
<button onClick={handleAddToCart} disabled={loading}>
Agregar al carrito
</button>
);
}
\`\`\`

### Acceder al estado del carrito

\`\`\`tsx
"use client";

import { useCartStore } from "@/hooks/stores/cart.store";

function CartSummary() {
const { items, total, amount } = useCartStore();

return (
<div>
<p>Items: {total()}</p>
<p>Total: S/. {amount().toFixed(2)}</p>
</div>
);
}
\`\`\`

### Métodos disponibles en el store

\`\`\`tsx
const {
// Estado
open, // boolean - Estado del CartSheet
items, // CartStoreItem[] - Items en el carrito
cartId, // number | null - ID del carrito actual
loading, // boolean - Estado de carga

// UI
setOpen, // (open: boolean) => void
setCartId, // (cartId: number | null) => void

// Operaciones
loadCart, // () => Promise<void> - Cargar desde DB
syncCart, // () => Promise<void> - Sincronizar con DB
addItem, // (productId, quantity?) => Promise<boolean>
removeItem, // (productId) => Promise<void>
updateQuantity,// (productId, quantity) => Promise<void>
clearCart, // () => Promise<void>

// Cálculos
total, // () => number - Total de items
amount, // () => number - Monto total en soles
} = useCartStore();
\`\`\`

## Flujo de Migración de Carrito

Cuando un usuario anónimo con productos en su carrito inicia sesión:

1. **Verificación automática**: El sistema detecta si hay carrito anónimo y carrito de usuario
2. **Modal de decisión**: Se muestra automáticamente preguntando:
   - "Fusionar ambos carritos" → Suma cantidades de productos duplicados
   - "Mantener solo mi carrito" → Conserva solo el carrito del usuario
3. **Limpieza**: Se elimina el carrito anónimo y la cookie `cart_id`

## Server Actions Disponibles

### `createCart(userId?: number)`

Crea un nuevo carrito. Si no se pasa userId, crea uno anónimo y guarda el ID en cookie.

### `getCartId()`

Obtiene el ID del carrito actual (desde cookie o usuario autenticado).

### `loadCart()`

Carga el carrito completo con todos sus items y datos de productos.

### `addItemToCart(productId, quantity)`

Agrega un producto al carrito con validación de stock.

### `updateCartItem(productId, quantity)`

Actualiza la cantidad de un producto. Si quantity es 0, lo elimina.

### `removeCartItem(productId)`

Elimina un producto del carrito.

### `clearCart()`

Limpia todos los items del carrito.

### `migrateAnonymousCart(shouldMerge)`

Migra el carrito anónimo al usuario autenticado.

### `checkPendingCartMigration()`

Verifica si hay un carrito anónimo pendiente de migración.

## Notas Importantes

- **Stock validation**: Todas las operaciones validan el stock disponible antes de agregar/actualizar
- **Optimistic updates**: La UI se actualiza inmediatamente y luego sincroniza con la DB
- **Error handling**: Todos los errores se manejan con toast notifications
- **Auto-open**: Al agregar un producto, el CartSheet se abre automáticamente
- **Cookie security**: Las cookies usan httpOnly, secure (en producción) y sameSite
- **Expiration**: Los carritos anónimos expiran después de 30 días

## Estructura de Archivos

\`\`\`
src/
├── hooks/stores/
│ └── cart.store.ts # Zustand store
├── services/cart/actions/
│ └── cart.actions.ts # Server actions
├── components/cart/
│ ├── cart-initializer.tsx # Inicializador + modal migración
│ └── add-to-cart-button.tsx # Componentes de ejemplo
├── app/(lobby)/\_layout/
│ ├── cart.tsx # CartSheet
│ └── cart-icon.tsx # Ícono del carrito
└── lib/
└── cart-middleware.ts # Middleware (futuro uso)
\`\`\`

## Ejemplo Completo

\`\`\`tsx
"use client";

import { useCartStore } from "@/hooks/stores/cart.store";
import { Button } from "@/components/ui/button";

export default function ProductPage({ product }) {
const { addItem, items, loading } = useCartStore();

// Verificar si el producto ya está en el carrito
const cartItem = items.find(item => item.productId === product.id);
const isInCart = !!cartItem;

const handleAddToCart = async () => {
const success = await addItem(product.id, 1);
if (success) {
console.log("Producto agregado exitosamente");
}
};

return (
<div>
<h1>{product.name}</h1>
<p>Precio: S/. {product.price}</p>
<p>Stock: {product.stock} unidades</p>

      {isInCart && (
        <p className="text-green-600">
          Ya tienes {cartItem.quantity} en el carrito
        </p>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={product.stock === 0 || loading}
      >
        {loading ? "Agregando..." : "Agregar al carrito"}
      </Button>
    </div>

);
}
\`\`\`
