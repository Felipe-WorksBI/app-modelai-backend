import { z } from "zod";

export const bodyScenario = z.object({
  prjName: z.string(),
});

export const responseScenario = z.object({
  data : z.object({
    prjId: z.uuid(),
    prjName:z.string(),
    createdBy:z.uuid(),
    updatedBy:z.uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
});
export const responseScenarioArray = z.object({
  data : z.array(z.object({
    prjId: z.uuid(),
    prjName:z.string(),
    createdBy:z.uuid(),
    updatedBy:z.uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })),
  total: z.number(),
});

export const bodyScenarioDetails = z.object({
  prjId:z.string(),
  prjFase:z.string(),
  areaVendida: z.number(),
  areaPermuta: z.number(),
  valorM2: z.number(),
  dataInicio: z.coerce.date(),
  prazoVendas: z.number(),
  pctValorizacao: z.number(),
  pctUnidadesVista: z.number(),
  pctEntrada: z.number(),
  qtdParcelas: z.number(),
  pctReforco: z.number(),
  qtdBaloes: z.number(),
  periodicidadeReforco: z.enum(['trimestral', 'semestral', 'anual']),
  pctJuros: z.number(),
});

export const responseScenarioDetails = z.object({
  data:z.object({
    id: z.number(),
    prjId:z.uuid(),
    prjFase:z.string(),
    areaVendida: z.number(),
    areaPermuta: z.number(),
    valorM2: z.number(),
    dataInicio: z.date(),
    prazoVendas: z.number(),
    pctValorizacao: z.number(),
    pctUnidadesVista: z.number(),
    pctEntrada: z.number(),
    qtdParcelas: z.number(),
    pctReforco: z.number(),
    qtdBaloes: z.number(),
    periodicidadeReforco: z.enum(['trimestral', 'semestral', 'anual']),
    pctJuros: z.number(),
    createdBy:z.uuid(),
    updatedBy:z.uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
});

