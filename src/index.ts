import { Plugin } from '@hapi/hapi';
import Boom from '@hapi/boom';
import { ZodSchema } from 'zod';
import './types'; 
import { fromError } from 'zod-validation-error';

const ZodValidatorPlugin: Plugin<null> = {
  name: 'ZodValidatorPlugin',
  register(server) {
    server.ext('onPreHandler', async (request, h) => {
      const routeValidation = request.route.settings.plugins.zod as {
        payload?: ZodSchema<any>,
        query?: ZodSchema<any>,
        params?: ZodSchema<any>,
        headers?: ZodSchema<any>,
        state?: ZodSchema<any>,
      };

      try {
        if (routeValidation?.payload) {
          const parsedPayload = routeValidation.payload.parse(request.payload);
          Object.assign(request, { payload: parsedPayload });
        }
        if (routeValidation?.query) {
          const parsedQuery = routeValidation.query.parse(request.query);
          Object.assign(request, { query: parsedQuery });
        }
        if (routeValidation?.params) {
          const parsedParams = routeValidation.params.parse(request.params);
          Object.assign(request, { params: parsedParams });
        }
        if (routeValidation?.headers) {
          const parsedHeaders = routeValidation.headers.parse(request.headers);
          Object.assign(request, { headers: parsedHeaders });
        }
        if (routeValidation?.state) {
          const parsedState = routeValidation.state.parse(request.state);
          Object.assign(request, { state: parsedState });
        }
        return h.continue;
      } catch (err) {
        return Boom.badRequest(fromError(err))
      }
    });
  }
};

export default ZodValidatorPlugin;