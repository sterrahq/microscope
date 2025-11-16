export function loggerMiddleware<T>(name: string) {
  return (prev: T, next: T) => {
    console.log(`[${name}] state changed "${prev}" => "${next}"`);

    return next;
  };
}
