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
