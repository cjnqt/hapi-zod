import { ZodTypeAny, ZodType } from 'zod';
type ZodSchema = ZodTypeAny | ZodType<any, any, any> | any | null;

declare module '@hapi/hapi' {
    interface PluginSpecificConfiguration {
        zod?: {
          payload?: ZodSchema;
          query?: ZodSchema;
          params?: ZodSchema;
          headers?: ZodSchema;
          state?: ZodSchema;
        };
    }
}


export interface HapiZodOptions {
  formatError?: (error: any) => string;
  boomError?: boolean;
  parse?: {
    payload?: boolean;
    query?: boolean;
    params?: boolean;
    headers?: boolean;
    state?: boolean;
  };
}