export type ErrorParams = {
  code?: string;
  retry?: boolean;
  timeout?: number;
  key?: string;
  values?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ErrorSingle = {
  message: string;
  params?: Record<string, unknown>;
};

export type DehydratedError = {
  type: keyof typeof ErrorByName;
  props?: Record<string, ErrorSingle>;
  code?: string;
  message?: string;
  params?: Record<string, unknown>;
  values?: Record<string, unknown>;
};

export enum ErrorName {
  NotFound = "not-found",
  Unauthorized = "unauthorized",
  PermissionDenied = "permission-denied",
  UnsupportedMediaType = "unsupported-media-type",
  EntityTooLarge = "entity-too-large",
  Conflict = "conflict",
  NotImplemented = "not-implemented",
  AlreadyExists = "already-exists",
  TooManyRequests = "too-many-requests",
  BadRequest = "bad-request",
  InvalidData = "invalid-data",
  InternalError = "internal-error",
  ServiceUnavailable = "service-unavailable",
  Validation = "validation",
  TimedOut = "timed-out",
}

export function hydrateError(error: DehydratedError) {
  if (error.type === ErrorName.Validation)
    return new ValidationError(error.props);

  if (ErrorByName[error.type as keyof typeof ErrorByName])
    return new ErrorByName[error.type](error?.message, error?.params);

  return new InternalError();
}

export class PaperfulError extends Error {
  status!: number;
  code?: string;
  retry?: boolean;
  timeout?: number;
  key?: string;
  params?: Record<string, unknown>;
  many?: Record<string, ErrorSingle>;
  values?: Record<string, unknown>;

  constructor(message?: string, params?: ErrorParams) {
    super(message);

    if (message) {
      this.message = message;
    }

    if (params) {
      if (params.code) this.code = params.code;
      if (params.retry) this.retry = true;
      if (params.timeout) this.timeout = params.timeout;
      if (params.key) this.key = params.key;
      if (params.values) this.values = params.values;

      delete params.code;
      delete params.retry;
      delete params.key;
      delete params.values;

      this.params = params;
    }
  }

  getMesssage(): ErrorSingle | Record<string, ErrorSingle> | undefined {
    if (!this.message) return undefined;
    if (this.many) return this.many;

    if (this.key) {
      return {
        [this.key]: {
          message: this.message,
          params: this.params,
        },
      };
    }

    return {
      message: this.message,
      params: this.params,
    };
  }
}

export class NotFound extends PaperfulError {
  override status = 404;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.NotFound;
  }
}

export class Unauthorized extends PaperfulError {
  override status = 401;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.Unauthorized;
  }
}

export class PermissionDenied extends PaperfulError {
  override status = 403;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.PermissionDenied;
  }
}

export class UnsupportedMediaType extends PaperfulError {
  override status = 415;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.UnsupportedMediaType;
  }
}

export class EntityTooLarge extends PaperfulError {
  override status = 413;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.EntityTooLarge;
  }
}

export class Conflict extends PaperfulError {
  override status = 409;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.Conflict;
  }
}

export class NotImplemented extends PaperfulError {
  override status = 501;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.NotImplemented;
  }
}

export class AlreadyExists extends PaperfulError {
  override status = 409;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.AlreadyExists;
  }
}

export class TooManyRequests extends PaperfulError {
  override status = 429;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.TooManyRequests;
  }
}

export class BadRequest extends PaperfulError {
  override status = 400;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.BadRequest;
  }
}

export class InvalidData extends PaperfulError {
  override status = 422;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.InvalidData;
  }
}

export class InternalError extends PaperfulError {
  override status = 422;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.InternalError;
  }
}

export class ServiceUnavailable extends PaperfulError {
  override status = 503;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.ServiceUnavailable;
  }
}

export class ValidationError extends PaperfulError {
  override status = 400;
  constructor(errors?: Record<string, ErrorSingle>, params?: ErrorParams) {
    super(JSON.stringify(errors), params);
    this.name = ErrorName.Validation;
    this.many = errors;
  }
}

export class TimedOut extends PaperfulError {
  override status = 408;
  constructor(message?: string, params?: ErrorParams) {
    super(message, params);
    this.name = ErrorName.TimedOut;
  }
}

export const ErrorByName = {
  [ErrorName.NotFound]: NotFound,
  [ErrorName.Unauthorized]: Unauthorized,
  [ErrorName.PermissionDenied]: PermissionDenied,
  [ErrorName.UnsupportedMediaType]: UnsupportedMediaType,
  [ErrorName.EntityTooLarge]: EntityTooLarge,
  [ErrorName.Conflict]: Conflict,
  [ErrorName.NotImplemented]: NotImplemented,
  [ErrorName.AlreadyExists]: AlreadyExists,
  [ErrorName.TooManyRequests]: TooManyRequests,
  [ErrorName.BadRequest]: BadRequest,
  [ErrorName.InvalidData]: InvalidData,
  [ErrorName.InternalError]: InternalError,
  [ErrorName.ServiceUnavailable]: ServiceUnavailable,
  [ErrorName.Validation]: ValidationError,
  [ErrorName.TimedOut]: TimedOut,
};
