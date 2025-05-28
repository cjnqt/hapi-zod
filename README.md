# Hapi-Zod Plugin

A plugin for Hapi.js that integrates Zod for request validation. This plugin simplifies the validation of payload, query, and params using Zod schemas.

## Requirements

- **Hapi.js**: Version 17 or higher
- **Node.js**: Version 16 or higher

## Installation

```bash
npm install hapi-zod
```

## Usage

```typescript
import Hapi from '@hapi/hapi';
import ZodValidatorPlugin from 'hapi-zod';
import { z } from 'zod';

const server = Hapi.server({
  port: 3000,
  host: 'localhost',
});

const payloadSchema = z.object({
  name: z.string(),
  age: z.number(),
});

server.route({
  method: 'POST',
  path: '/example',
  options: {
    plugins: {
      zod: {
        payload: payloadSchema,
      },
    },
  },
  handler: (request, h) => {
    return h.response({ message: 'Validation passed!' });
  },
});

const start = async () => {
  await server.register(ZodValidatorPlugin);
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

start();
```

## Collaborators

- **Balaji L Narayanan**: [lbalaji8385@gmail.com](mailto:lbalaji8385@gmail.com)
- **Rajesh Shah**: [shahrajesh2113@yahoo.com](mailto:shahrajesh2113@yahoo.com)

## Contributing

We welcome contributions to enhance this plugin. If you have ideas or improvements, feel free to submit a pull request.

## Issues

If you encounter any issues, please raise them on our [GitHub Issues page](https://github.com/balaji8385/hapi-zod/issues).

## License

This project is licensed under the MIT License.