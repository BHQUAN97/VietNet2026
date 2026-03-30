export function ok<T>(data: T, message = 'OK') {
  return { success: true, data, message };
}

export function fail(message: string, statusCode = 400) {
  return { success: false, data: null, message, statusCode };
}

export function paginated<T>(
  data: T[],
  meta: { page: number; limit: number; total: number },
) {
  return {
    success: true,
    data,
    message: 'OK',
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  };
}
