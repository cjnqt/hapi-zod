import { Plugin } from "@hapi/hapi";
import Boom from "@hapi/boom";
import { ZodSchema } from "zod";
import "./types";
import { fromError } from "zod-validation-error";
import { HapiZodOptions} from "./types";
import { swaggerPlugin, extendZodWithSwagger } from "./swaggerplugin";

const ZodValidatorPlugin = (options: HapiZodOptions = {}): Plugin<null> => {
  const { boomError = true, parse = { payload: true, query: true, params: true, headers: true, state: true } } = options || {};
  const supportedProps = ['payload', 'query', 'params', 'headers', 'state'] as const;
  return {
    name: "ZodValidatorPlugin",
    register(server) {
      server.ext("onPreHandler", async (request, h) => {
        const routeValidation = request.route.settings.plugins.zod as {
          payload?: ZodSchema<any>;
          query?: ZodSchema<any>;
          params?: ZodSchema<any>;
          headers?: ZodSchema<any>;
          state?: ZodSchema<any>;
        };

        try {

          for (const prop of supportedProps) {
            if (routeValidation?.[prop] && parse[prop]) {
              const parsedProp = routeValidation[prop].parse(request[prop]);
              Object.assign(request, { [prop]: parsedProp });
            }
          }

          return h.continue;
        } catch (err) {
          const error = options.formatError ? options.formatError(err) : fromError(err).message;
          if(boomError) {
            return Boom.badRequest(error);
          }
          throw new Error(error);
        }
      });
    },
  };
};

export default ZodValidatorPlugin;
export { HapiZodOptions };
export type ZodValidatorPlugin = typeof ZodValidatorPlugin;
export { swaggerPlugin } from "./swaggerplugin";
export { ZodDocsOptions } from "./swaggerplugin";
export type SwaggerPlugin = typeof swaggerPlugin;
export { extendZodWithSwagger };
export {OpenAPIObjectConfig} from '@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator';