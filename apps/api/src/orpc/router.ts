import { contract } from "@leadsroute/contracts";
import { prisma } from "@leadsroute/database";
import { implement, ORPCError } from "@orpc/server";
import { searchPlacesByText } from "../services/google-places.js";

const os = implement(contract);

const hello = os.system.hello.handler(async () => {
  const health = await prisma.appHealth.create({
    data: {
      message: "Hello World!",
    },
  });

  return { message: health.message };
});

const importBySearch = os.lead.importBySearch.handler(async ({ input }) => {
  const searchResult = await searchPlacesByText({
    termo: input.termo,
    cidade: input.cidade,
    limite: input.limite,
  });

  let importedWithPhone = 0;
  let importedWithoutPhone = 0;
  let updated = 0;
  let skipped = 0;

  for (const lead of searchResult.leads) {
    if (!lead.nomeEmpresa || !lead.enderecoCompleto || !lead.cidade) {
      skipped += 1;
      continue;
    }

    const exists = await prisma.lead.findUnique({
      where: { placeId: lead.placeId },
      select: { id: true },
    });

    await prisma.lead.upsert({
      where: { placeId: lead.placeId },
      update: {
        nomeEmpresa: lead.nomeEmpresa,
        telefone: lead.telefone,
        enderecoCompleto: lead.enderecoCompleto,
        numero: lead.numero,
        rua: lead.rua,
        bairro: lead.bairro,
        cidade: lead.cidade,
        estado: lead.estado,
      },
      create: {
        placeId: lead.placeId,
        nomeEmpresa: lead.nomeEmpresa,
        telefone: lead.telefone,
        enderecoCompleto: lead.enderecoCompleto,
        numero: lead.numero,
        rua: lead.rua,
        bairro: lead.bairro,
        cidade: lead.cidade,
        estado: lead.estado,
      },
    });

    if (exists) {
      updated += 1;
    } else if (lead.telefone) {
      importedWithPhone += 1;
    } else {
      importedWithoutPhone += 1;
    }
  }

  return {
    importedWithPhone,
    importedWithoutPhone,
    updated,
    skipped,
    totalProcessed: searchResult.leads.length,
  };
});

const listLeads = os.lead.list.handler(async ({ input }) => {
  const page = input.page;
  const pageSize = input.pageSize;

  const where = {
    ...(input.cidade
      ? {
          cidade: {
            equals: input.cidade,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(input.search
      ? {
          OR: [
            {
              nomeEmpresa: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
            {
              enderecoCompleto: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(input.hasPhone === true
      ? {
          telefone: {
            not: null,
          },
        }
      : {}),
    ...(input.hasPhone === false
      ? {
          telefone: null,
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    total,
    page,
    pageSize,
  };
});

const getLeadById = os.lead.getById.handler(async ({ input }) => {
  const lead = await prisma.lead.findUnique({
    where: { id: input.id },
  });

  if (!lead) {
    throw new ORPCError("NOT_FOUND", {
      message: "Lead não encontrado.",
    });
  }

  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
});

export const router = os.router({
  system: {
    hello,
  },
  lead: {
    importBySearch,
    list: listLeads,
    getById: getLeadById,
  },
});
