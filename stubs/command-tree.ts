import type { z } from "zod";

type AnySchema = z.ZodType<any, any>;

type Command = { input: AnySchema; output: AnySchema };

export type CommandTree = Record<string, Record<string, Command>>;

export type ServiceTree = Record<string, Record<string, (input: any) => Promise<any>>>;
