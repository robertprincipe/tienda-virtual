"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Icon } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ExpandableChat } from "./chat/expandable-chat";

export function WhatsAppButton() {
  return (
    <ExpandableChat
      size="sm"
      className="max-h-[320px] min-[352px]:max-h-[300px]"
    >
      <div className="bg-[#25D366] flex items-center p-4 space-x-2">
        <Icon icon="logos:whatsapp-icon" className="w-16 h-16" />
        <div>
          <h3 className="text-lg font-semibold">Contactar por WhatsApp</h3>
          <p className="leading-5">
            Para una atencion personalizada puedes ingresar tu nombre.
          </p>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <img
            src="https://avatars.githubusercontent.com/u/51280187?v=4"
            alt=""
            className="size-12 rounded-full"
          />
          <div>
            <h3 className="text-lg font-medium leading-3.5">Robert</h3>
            <p>Vendedor experto</p>
          </div>
        </div>
        <form className="bg-background">
          <div className="space-y-2">
            <Label>
              Nombre
              <span className="text-sm text-muted-foreground"> (opcional)</span>
            </Label>
            <Input
              placeholder={"Escribe tu nombre aquí"}
              className={cn(
                "w-full text-base leading-normal",
                "border-[#25D366] bg-white hover:bg-[#25D366]/5 focus:bg-[#25D366]/10 hover:border-[#25D366]/20 hover:ring-[#25D366]/20 focus:border-[#25D366]/40 focus:ring-[#25D366]/40"
              )}
            />
            <Button
              type="submit"
              className="bg-[#25D366] hover:bg-[#25D366]/90 w-full"
            >
              <Icon icon="bxs:send" />
              <span>Ir al chat</span>
            </Button>
          </div>
        </form>
      </div>
    </ExpandableChat>
  );
}
