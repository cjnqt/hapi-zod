export const normalizeBooleans = (obj: Record<string, any>) => {
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string') {
        if (val === 'true') obj[key] = true;
        else if (val === 'false') obj[key] = false;
      } else if (Array.isArray(val)) {
        obj[key] = val.map((v) => (v === 'true' ? true : v === 'false' ? false : v));
      }
    }
    return obj;
  }