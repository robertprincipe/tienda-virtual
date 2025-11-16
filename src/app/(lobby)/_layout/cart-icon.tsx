import { Icon } from "@iconify/react";
import { useCartStore } from "@/hooks/stores/cart.store";

export function CartIcon() {
  const [setOpen, total] = useCartStore((state) => [
    state.setOpen,
    state.total,
  ]);
  return (
    <button
      type="button"
      className="block relative hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-md px-1"
      onClick={() => setOpen(true)}
    >
      <Icon
        icon="material-symbols-light:shopping-basket"
        className="text-4xl"
      />
      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
        <span>{total()}</span>
      </div>
    </button>
  );
}
