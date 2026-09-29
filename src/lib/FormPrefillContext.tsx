"use client";

import { createContext, useContext, useRef, useState } from "react";

export type SolutionInterest =
  | "aiAgent"
  | "chatbot"
  | "appointments"
  | "quotes"
  | "website"
  | "menu"
  | "notSure";

export type FormPrefill = {
  businessType?: string;
  mainTask?: string;
  solutionInterest?: SolutionInterest;
};

type ContextValue = {
  prefill: FormPrefill | null;
  requestContact: (prefill: FormPrefill) => void;
  consumePrefill: () => FormPrefill | null;
};

const FormPrefillContext = createContext<ContextValue | null>(null);

export function FormPrefillProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefill, setPrefill] = useState<FormPrefill | null>(null);
  const consumedRef = useRef<FormPrefill | null>(null);

  function requestContact(next: FormPrefill) {
    consumedRef.current = next;
    setPrefill(next);
    const target = document.querySelector("#contacto");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function consumePrefill() {
    return consumedRef.current;
  }

  return (
    <FormPrefillContext.Provider
      value={{ prefill, requestContact, consumePrefill }}
    >
      {children}
    </FormPrefillContext.Provider>
  );
}

export function useFormPrefill() {
  const ctx = useContext(FormPrefillContext);
  if (!ctx) {
    throw new Error("useFormPrefill must be used within a FormPrefillProvider");
  }
  return ctx;
}
