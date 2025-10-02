import { InferInsertModel } from 'drizzle-orm'
import { 
    pgTable,
    uuid,
    text,
    timestamp,
    pgEnum,
    serial,
    integer,
    date,
    numeric
} from 'drizzle-orm/pg-core'

// const STATUS = pgEnum('status', ['active', 'inactive', 'pending'])
type Test = InferInsertModel<typeof users>

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),
  updatedAt: timestamp('updated_at',{withTimezone:true}).defaultNow().notNull(),
  status: text('status').notNull().default('active'),
  role: text('role').notNull().default('user'),
  companyName: text('company_name'),
})

//Scenarios
export const projects = pgTable('projects',{
  prjId: uuid('project_id').primaryKey().defaultRandom(),
  prjName: text('project_name').notNull().unique(),
  createdAt: timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),
  updatedAt: timestamp('updated_at',{withTimezone:true}).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id)
})

//Empreendimentos
export const properties = pgTable('properties',{
  empId: uuid('emp_id').primaryKey().defaultRandom(),
  prjId: uuid('prj_id').notNull().references(() => projects.prjId),
  empName: text('emp_name').notNull().unique(),
  createdAt: timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),
  updatedAt: timestamp('updated_at',{withTimezone:true}).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id)
})


export const reinforcementFrequency = pgEnum('periodo_reforco', ['trimestral', 'semestral', 'anual'])

export const projectDetails = pgTable('project_details',{
  id: serial('id').primaryKey(),
  prjId: uuid('prj_id').notNull().references(() => projects.prjId),
  empId: uuid('emp_id').notNull().references(() => properties.empId),
  prjFase: text('prj_fase').notNull().default('Fase 1'),
  areaVendida: numeric('area_vendida',{precision:10,scale:2,mode:'number'}).default(0), //Área Vendida (m²)
  areaPermuta: numeric('area_permuta',{precision:10,scale:2,mode:'number'}).notNull(), //Área vendável líquida de permuta (m²)
  valorM2: numeric('valor_m2',{precision:10,scale:2,mode:'number'}).notNull(), // Valor estimado do m² (R$) em CENTAVOS
  dataInicio: date('data_inicio', {mode:'string'}).defaultNow().notNull(), //Mês de início das vendas
  prazoVendas:  numeric('prazo_vendas',{precision:5,scale:2,mode:'number'}).notNull(), //Prazo de vendas (meses)
  pctValorizacao: numeric('pct_valorizacao',{precision:5,scale:2,mode:'number'}).notNull().default(0), //Valorização mensal (%)
  pctUnidadesVista: numeric('pct_unidades_vista',{precision:5,scale:2,mode:'number'}).default(0), //% de unidades à vista
  pctEntrada: numeric('pct_entrada',{precision:5,scale:2,mode:'number'}).notNull().default(0), // Entrada (%)
  pctReforco: numeric('pct_reforco',{precision:5,scale:2,mode:'number'}).notNull().default(0), // % Recebido por Reforço
  qtdParcelas: integer('qtd_parcelas').notNull(), //Quantidade de Parcelas
  qtdBaloes: integer('qtd_baloes').notNull(), //Quantidade de Reforços
  periodicidadeReforco: reinforcementFrequency('periodicidade_reforco').default('anual'), //Periodicidade do Reforço
  pctJuros: numeric('pct_juros',{precision:5,scale:2,mode:'number'}).notNull().default(0), // Juros (a.m %)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
})

type ProjectDetails = InferInsertModel<typeof projectDetails>;

// Custos de obra
export const projectExpenses = pgTable('project_expenses',{
  id: serial('id').primaryKey().notNull(),
  prjId: uuid('prj_id').notNull().references(() => projects.prjId),
  empId: uuid('emp_id').notNull().references(() => properties.empId),
  dataInicioCusto: date('data_inicio_custo', {mode:'string'}).defaultNow().notNull(), //Mês do Primeiro Desembolso
  tempoObra: integer('tempo_obra').notNull(), // Tempo de Obra (meses)
  custoM2: numeric('custo_m2',{precision:10,scale:2,mode:'number'}).default(0), // Custo por m² (R$) em CENTAVOS
  custoTotalProjetado: numeric('custo_total_projetado',{precision:10,scale:2,mode:'number'}).notNull(), // Custo Total Projetado (R$) em CENTAVOS
  areaConstruidaTotal: numeric('area_construida_total',{precision:10,scale:2,mode:'number'}).notNull(), // Área Construída Total (m²)
  reajusteAnual: numeric('reajuste_anual',{precision:5,scale:2,mode:'number'}).default(0), // Reajuste Anual (%)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
})

export const classificationTypes = pgEnum('tipo_valor', ['entrada', 'licença', 'parcela','escritura'])
export const realEstateTypes = pgEnum('tipo', ['Terreno', 'Registro e Incorporação', 'Outros'])

export const realEstateDetails = pgTable('real_estate_details',{
  realEstateId: uuid('real_estate_id').primaryKey().defaultRandom(),
  prjId: uuid('prj_id').notNull().references(() => projects.prjId),
  empId: uuid('emp_id').notNull().references(() => properties.empId),
  tipoRealEstate: realEstateTypes('tipo_real_estate').notNull(), // Tipo de Custo
  dataCompra: date('data_compra', {mode:'string'}).defaultNow().notNull(), //Data de Compra do Terreno
  valor: numeric('valor',{precision:10,scale:2,mode:'number'}).notNull(), // Valor (R$) em CENTAVOS
  tipoValor: classificationTypes('tipo_valor').notNull(), // Tempo de Obra (meses)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
})

export const InstallmentsClassification = pgEnum('tipo_parcela', ['Entrada', 'Parcela','Pagamento Final', 'Intermediário'])

export const realEstatePayments = pgTable('real_state_payments',{
  paymentId: serial('payment_id').primaryKey(),
  realEstateId: uuid('real_estate_id').notNull().references(() => realEstateDetails.realEstateId),
  prjId: uuid('prj_id').notNull().references(() => projects.prjId),
  empId: uuid('emp_id').notNull().references(() => properties.empId),
  dataVencimento: date('data_vencimento', {mode:'string'}).defaultNow().notNull(), //Data de Vencimento
  tipoParcela: InstallmentsClassification('tipo_parcela').notNull(), // Tempo de Obra (meses)
  numeroParcela: integer('numero_parcela').notNull().default(1), // Número da Parcela
  valorParcela: numeric('valor_parcela',{precision:10,scale:2,mode:'number'}).notNull(), // Valor da Parcela (R$) em CENTAVOS
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
})

export const admExpTypes = pgEnum('tipo_despesa', ['Marketing', 'Comissão de vendas','Taxa de Gestão', 'Impostos'])
// export const calculatedBase = pgEnum('base_calulo', ['% Sobre VGV', '% Sobre Entrada de Caixa','% sobre Cada Venda', '% sobre Custo da Obra','% sobre Resultado'])
export const administrativeExpenses = pgTable('administrative_expenses',{
  id: serial('id').primaryKey(),
  prjId: uuid('prj_id').notNull().references(() => projects.prjId),
  empId: uuid('emp_id').notNull().references(() => properties.empId),
  dataInicioCusto: date('data_inicio_custo', {mode:'string'}).defaultNow().notNull(), //Mês do Primeiro Desembolso
  mesesAtivo: integer('meses_ativo').notNull().default(0), //Meses ativos
  tipoDespesa: admExpTypes('tipo_despesa').notNull(),
  pctValor: numeric('pct_valor',{precision:5,scale:2,mode:'number'}).notNull(),
  baseCalculo: text('base_calulo').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
})

export const propertyAcquisitions = pgTable('property_acquisitions',{
  propertyId: uuid('property_id').primaryKey().defaultRandom(),
  prjId: uuid('prj_id').notNull().references(() => projects.prjId),
  empId: uuid('emp_id').notNull().references(() => properties.empId),
  numeroInstituicao: integer('numero_instituicao').notNull().default(1), // Número da Instituição
  nomeEmpresa: text('nome_empresa').notNull(), // Nome do Player/Instituição
  dataCaptacao: date('data_captacao', {mode:'string'}).defaultNow().notNull(),
  dataInicioPagamento: date('data_inicio_pagamento', {mode:'string'}).defaultNow().notNull(), //Data de Início do Pagamento
  valorCaptacao: numeric('valor_captacao',{precision:10,scale:2,mode:'number'}).notNull(), // Valor da Captacao (R$) em CENTAVOS
  qtdParcelas: integer('qtd_parcelas').notNull().default(1), // Número da Parcelas
  jurosAno: numeric('juros_ano',{precision:5,scale:2,mode:'number'}).notNull().default(0), // Taxa de Juros (% a.a.)
  carenciaMeses: integer('carencia_meses').notNull().default(0), // Carência (meses)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
})
