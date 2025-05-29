import Hapi from '@hapi/hapi';
import Boom from '@hapi/boom';
import ZodValidatorPlugin from '../src';
import { z } from 'zod';

describe('ZodValidatorPlugin', () => {
  let server: Hapi.Server;

  beforeEach(async () => {
    server = Hapi.server({ port: 3000 });
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should use boomError to customize error response', async () => {
    const payloadSchema = z.object({ name: z.string() });

    await server.register(
      ZodValidatorPlugin({
        boomError: true,
      })
    );

    server.route({
      method: 'POST',
      path: '/test',
      options: {
        plugins: {
          zod: { payload: payloadSchema },
        },
      },
      handler: () => 'Success',
    });

    const res = await server.inject({
      method: 'POST',
      url: '/test',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    expect(res.result).toHaveProperty('message', 'Custom: Required');
  });

  it('should use formatError to format error response', async () => {
    const payloadSchema = z.object({ name: z.string() });

    await server.register(
      ZodValidatorPlugin({
        formatError: (err) => ('INVALID_PAYLOAD'),
      })
    );

    server.route({
      method: 'POST',
      path: '/test',
      options: {
        plugins: {
          zod: { payload: payloadSchema },
        },
      },
      handler: () => 'Success',
    });

    const res = await server.inject({
      method: 'POST',
      url: '/test',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    expect(res.result).toEqual({ error: 'Required', code: 'INVALID_PAYLOAD' });
  });

  it('should respect parse options to disable query parsing', async () => {
    const querySchema = z.object({ id: z.string() });

    await server.register(
      ZodValidatorPlugin({
        parse: { query: false },
      })
    );

    server.route({
      method: 'GET',
      path: '/test',
      options: {
        plugins: {
          zod: { query: querySchema },
        },
      },
      handler: () => 'Success',
    });

    const res = await server.inject({
      method: 'GET',
      url: '/test?id=123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.result).toBe('Success');
  });
});