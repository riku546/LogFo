export class IntegrationUnauthorizedError extends Error {
  constructor(
    public provider: string,
    message?: string,
  ) {
    super(
      message || `${provider} integration is unauthorized. Please re-connect.`,
    );
    this.name = "IntegrationUnauthorizedError";
  }
}
