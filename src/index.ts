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
          const validatedPayload = routeValidation.payload.parse(request.payload);
          Object.defineProperty(request, 'payload', { value: validatedPayload, writable: false });
        }
        if (routeValidation?.query) {
          Object.defineProperty(request, 'query', { value: routeValidation.query.parse(request.query), writable: false });
        }
        if (routeValidation?.params) {
          Object.defineProperty(request, 'params', { value: routeValidation.params.parse(request.params), writable: false });
        }
        if (routeValidation?.headers) {
          Object.defineProperty(request, 'headers', { value: routeValidation.headers.parse(request.headers), writable: false });
        }
        if (routeValidation?.state) {
          Object.defineProperty(request, 'state', { value: routeValidation.state.parse(request.state), writable: false });
        }
        return h.continue;
      } catch (err) {
        return Boom.badRequest(fromError(err))
      }
    });
  }
};

export default ZodValidatorPlugin;