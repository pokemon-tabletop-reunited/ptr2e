export class PTR2eSocketError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "PTR2eSocketError";
  }
}

export class PTR2eSocketInternalError extends PTR2eSocketError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "PTR2eSocketInternalError";
  }
}

export class PTR2eSocketInvalidUserError extends PTR2eSocketError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "PTR2eSocketInvalidUserError";
  }
}

export class PTR2eSocketNoGMConnectedError extends PTR2eSocketError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "PTR2eSocketNoGMConnectedError";
  }
}

export class PTR2eSocketRemoteException extends PTR2eSocketError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "PTR2eSocketRemoteException";
  }
}

export class PTR2eSocketUnregisteredHandlerError extends PTR2eSocketError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "PTR2eSocketUnregisteredHandlerError";
  }
}

export class PTR2eSocketDeniedError extends PTR2eSocketError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "PTR2eSocketDeniedError";
  }
}