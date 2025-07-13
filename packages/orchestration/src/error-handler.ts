import { DataPrismError } from "./types.js";

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: DataPrismError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(
    error: unknown,
    source: "wasm" | "duckdb" | "orchestration",
  ): DataPrismError {
    const dataPrismError: DataPrismError = {
      message: error instanceof Error ? error.message : String(error),
      code: this.generateErrorCode(source),
      source,
    };

    this.errorLog.push(dataPrismError);
    console.error(`DataPrism Error [${source}]:`, dataPrismError);

    return dataPrismError;
  }

  private generateErrorCode(source: string): string {
    const timestamp = Date.now();
    const prefix = source.toUpperCase().slice(0, 3);
    return `${prefix}_${timestamp}`;
  }

  getErrorHistory(): DataPrismError[] {
    return [...this.errorLog];
  }

  clearErrorHistory(): void {
    this.errorLog = [];
  }
}

// Global error handler for unhandled promise rejections
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const errorHandler = ErrorHandler.getInstance();
    errorHandler.handleError(event.reason, "orchestration");
  });
}
