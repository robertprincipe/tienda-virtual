"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ExpandableChat } from "./chat/expandable-chat";

interface WhatsAppButtonProps {
  phone?: string | null;
  logoUrl?: string | null;
}

export function WhatsAppButton({ phone, logoUrl }: WhatsAppButtonProps) {
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      alert("No hay un número de WhatsApp configurado");
      return;
    }

    // Format phone number (remove spaces and special chars)
    const phoneFormatted = phone.replace(/\s+/g, "");

    // Create WhatsApp link with the message
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${encodeURIComponent(
      message || "Hola, necesito información"
    )}`;

    // Open in new tab
    window.open(whatsappUrl, "_blank");
  };

  return (
    <ExpandableChat
      size="sm"
      className="max-h-[420px] min-[352px]:max-h-[400px]"
    >
      <div className="bg-[#25D366] flex items-center p-4 space-x-2">
        <Icon icon="logos:whatsapp-icon" className="w-16 h-16" />
        <div>
          <h3 className="text-lg font-semibold text-white">
            Contactar por WhatsApp
          </h3>
          <p className="leading-5 text-white/90">
            Escribe tu mensaje y te responderemos pronto.
          </p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="size-12 rounded-full object-cover"
            />
          ) : (
            <div className="size-12 rounded-full bg-[#25D366] flex items-center justify-center">
              <Icon icon="logos:whatsapp-icon" className="w-8 h-8" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium leading-tight">Lucy</h3>
            <p className="text-sm text-muted-foreground">Asesora de ventas</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-background">
          <div className="space-y-2">
            <Label htmlFor="whatsapp-message">Tu mensaje</Label>
            <Textarea
              id="whatsapp-message"
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={cn(
                "w-full text-base leading-normal resize-none",
                "border-[#25D366] bg-white hover:bg-[#25D366]/5 focus:bg-[#25D366]/10 hover:border-[#25D366]/20 hover:ring-[#25D366]/20 focus:border-[#25D366]/40 focus:ring-[#25D366]/40"
              )}
            />
            <Button
              type="submit"
              className="bg-[#25D366] hover:bg-[#25D366]/90 w-full"
            >
              <Icon icon="bxs:send" />
              <span>Enviar mensaje</span>
            </Button>
          </div>
        </form>
      </div>
    </ExpandableChat>
  );
}
