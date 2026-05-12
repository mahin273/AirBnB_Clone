/**
 * Ping service — business logic layer.
 * Demonstrates the Router → Controller → Service pattern.
 */
export const getPingResponse = (id: string) => {
  return {
    id,
    message: 'pong',
    timestamp: new Date().toISOString(),
  };
};
