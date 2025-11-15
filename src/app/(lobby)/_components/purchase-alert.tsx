"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface UseProgressTimerProps {
  duration: number;
  interval?: number;
  onComplete?: () => void;
}

function useProgressTimer({
  duration,
  interval = 100,
  onComplete,
}: UseProgressTimerProps) {
  const [progress, setProgress] = useState(duration);
  const timerRef = useRef(0);
  const timerState = useRef({
    startTime: 0,
    remaining: duration,
    isPaused: false,
  });

  const cleanup = useCallback(() => {
    window.clearInterval(timerRef.current);
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setProgress(duration);
    timerState.current = {
      startTime: 0,
      remaining: duration,
      isPaused: false,
    };
  }, [duration, cleanup]);

  const start = useCallback(() => {
    const state = timerState.current;
    state.startTime = Date.now();
    state.isPaused = false;

    timerRef.current = window.setInterval(() => {
      const elapsedTime = Date.now() - state.startTime;
      const remaining = Math.max(0, state.remaining - elapsedTime);

      setProgress(remaining);

      if (remaining <= 0) {
        cleanup();
        onComplete?.();
      }
    }, interval);
  }, [interval, cleanup, onComplete]);

  const pause = useCallback(() => {
    const state = timerState.current;
    if (!state.isPaused) {
      cleanup();
      state.remaining = Math.max(
        0,
        state.remaining - (Date.now() - state.startTime)
      );
      state.isPaused = true;
    }
  }, [cleanup]);

  const resume = useCallback(() => {
    const state = timerState.current;
    if (state.isPaused && state.remaining > 0) {
      start();
    }
  }, [start]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    progress,
    start,
    pause,
    resume,
    reset,
  };
}

export function PurchaseAlert() {
  const [open, setOpen] = useState(false);
  const toastDuration = 5000;
  const { progress, start, pause, resume, reset } = useProgressTimer({
    duration: toastDuration,
    onComplete: () => setOpen(false),
  });

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        reset();
        start();
      }
    },
    [reset, start]
  );

  const handleButtonClick = useCallback(() => {
    if (open) {
      setOpen(false);
      // Wait for the close animation to finish
      window.setTimeout(() => {
        handleOpenChange(true);
      }, 150);
    } else {
      handleOpenChange(true);
    }
  }, [open, handleOpenChange]);

  return (
    <ToastProvider swipeDirection="left">
      <Toast
        open={open}
        className="rounded-2xl p-3 pr-3"
        onOpenChange={handleOpenChange}
        onPause={pause}
        onResume={resume}
      >
        <div className="flex w-full justify-between gap-3">
          <img
            src="https://galaximart.com/cdn/shop/files/DT235-Photoroom_c50c40d9-cf4d-4618-a8ba-537b38dfbeea.jpg?v=1708274255&width=1500"
            className="h-16 w-16 rounded-md object-cover"
            alt=""
          />
          <div className="flex grow flex-col gap-3">
            <div className="space-y-1">
              <div className="pb-1.5">
                <ToastTitle className="flex items-center gap-2 text-[15px]">
                  <span>Juan de Iquitos - Perú</span>{" "}
                  <Icon icon="flagpack:pe" />
                </ToastTitle>
                <ToastDescription className="!text-[14px] space-x-1 text-zinc-600">
                  <span>Compro una Silla Gamer</span>
                  <span>&bull;</span>
                  <span>Justo ahora</span>
                </ToastDescription>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/"
                  className="flex items-center gap-0.5 text-blue-500"
                >
                  Comprar ahora{" "}
                  <Icon icon="material-symbols:arrow-forward-ios-rounded" />
                </Link>

                <div className="text-sm text-blue-500 flex items-center gap-0.5">
                  <Icon icon="garden:check-badge-fill-16" />
                  <span>Compra verificada.</span>
                </div>
              </div>
            </div>
          </div>
          <ToastClose asChild>
            <Button
              variant="ghost"
              className="group size-6 shrink-0 p-0 hover:bg-transparent"
              size="icon"
              aria-label="Close notification"
            >
              {/* <XIcon
                size={46}
                className="opacity-60 transition-opacity group-hover:opacity-100 text-3xl"
                aria-hidden="true"
              /> */}
              <Icon icon="gg:close" className="text-2xl" />
            </Button>
          </ToastClose>
        </div>
        <div className="contents" aria-hidden="true">
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-emerald-500"
            style={{
              width: `${(progress / toastDuration) * 100}%`,
              transition: "width 100ms linear",
            }}
          />
        </div>
      </Toast>
      <ToastViewport className="sm:right-auto sm:left-0" />
    </ToastProvider>
  );
}
