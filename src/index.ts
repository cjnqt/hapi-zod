import { Plugin } from "@hapi/hapi";
import Boom from "@hapi/boom";
import { ZodSchema } from "zod";
import "./types";
import { fromError } from "zod-validation-error";
import { HapiZodOptions} from "./types";

const ZodValidatorPlugin = (options: HapiZodOptions): Plugin<null> => {
  const { boomError = true, parse = { payload: true, query: true, params: true, headers: true, state: true } } = options || {};

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
          if (routeValidation?.payload && parse.payload) {
            const parsedPayload = routeValidation.payload.parse(request.payload);
            Object.assign(request, { payload: parsedPayload });
          }
          if (routeValidation?.query && parse.query) {
            const parsedQuery = routeValidation.query.parse(request.query);
            Object.assign(request, { query: parsedQuery });
          }
          if (routeValidation?.params && parse.params) {
            const parsedParams = routeValidation.params.parse(request.params);
            Object.assign(request, { params: parsedParams });
          }
          if (routeValidation?.headers && parse.headers) {
            const parsedHeaders = routeValidation.headers.parse(request.headers);
            Object.assign(request, { headers: parsedHeaders });
          }
          if (routeValidation?.state && parse.state) {
            const parsedState = routeValidation.state.parse(request.state);
            Object.assign(request, { state: parsedState });
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