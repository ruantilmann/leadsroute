import { oc } from "@orpc/contract";
import { z } from "zod";

export const leadSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  nomeEmpresa: z.string(),
  telefone: z.string().nullable(),
  enderecoCompleto: z.string(),
  numero: z.string().nullable(),
  rua: z.string().nullable(),
  bairro: z.string().nullable(),
  cidade: z.string(),
  estado: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const importBySearchInputSchema = z.object({
  termo: z.string().min(2),
  cidade: z.string().min(2),
  limite: z.number().int().min(1).max(100).default(20),
});

export const importBySearchOutputSchema = z.object({
  importedWithPhone: z.number().int().min(0),
  importedWithoutPhone: z.number().int().min(0),
  updated: z.number().int().min(0),
  skipped: z.number().int().min(0),
  totalProcessed: z.number().int().min(0),
});

export const leadListInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  cidade: z.string().trim().min(1).optional(),
  hasPhone: z.boolean().optional(),
});

export const leadListOutputSchema = z.object({
  items: z.array(leadSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
});

export const leadGetByIdInputSchema = z.object({
  id: z.string().min(1),
});

export const leadGetByIdOutputSchema = leadSchema;

export const leadContract = {
  importBySearch: oc
    .input(importBySearchInputSchema)
    .output(importBySearchOutputSchema),
  list: oc.input(leadListInputSchema).output(leadListOutputSchema),
  getById: oc.input(leadGetByIdInputSchema).output(leadGetByIdOutputSchema),
};
