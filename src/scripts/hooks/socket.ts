/* eslint-disable @typescript-eslint/ban-types */
import FolderPTR2e from "@module/folder/document.ts";
import { PTRHook } from "./data.ts";

export const Sockets: PTRHook = {
  listen: () => {
    Hooks.once("ready", () => {
      game.socket.on("system.ptr2e", handleSocketRequest);
    });
    Hooks.on("userConnected", handleUserActivity);
  }
}

/**
 * Old Implementation - Delete after migrating
 */

export interface SocketRequestData {
  request: "folderCreateOrUpdate" | "acknowledge" | "acknowledgeFailure";
  data: Record<string, unknown>;
  message?: string;
  id: string;
  documentId?: string;
  documentType?: string;
}

async function handleSocketRequest(data: SocketRequestData): Promise<void> {
  if (typeof data !== 'object' || !('request' in data)) return;
  console.log(data);
  if (game.user !== game.users.activeGM) return;

  switch (data.request) {
    case "folderCreateOrUpdate": {
      if (!game.settings.get("ptr2e", "player-folder-create-permission")) return void game.socket.emit("system.ptr2e", { id: data.id, request: "acknowledgeFailure", message: "Player folder creation is disabled. Please ask your GM to enable it in settings." });
      const folderData = data.data as { name?: string, _id?: string, source?: Folder['_source'], pack?: string } & Record<string, unknown>;

      if (!folderData.name?.trim()) folderData.name = Folder.defaultName();
      if (folderData._id) {
        const folder = game.folders.get(folderData._id)
        if (folder) {
          delete folderData._id;
          await folder.update(folderData);
          return void game.socket.emit("system.ptr2e", { id: data.id, request: "acknowledge", message: `Folder ${folder.name} updated!`, documentId: folder.id, documentType: "Folder" });
        }
      }
      else {
        if (folderData.source) {
          const folder = await FolderPTR2e.create(folderData.source, { pack: folderData.pack });
          return void game.socket.emit("system.ptr2e", { id: data.id, request: "acknowledge", message: `Folder ${folderData.source.name} created!`, documentId: folder?.id, documentType: "Folder" });
        }
      }
      return void game.socket.emit("system.ptr2e", { id: data.id, request: "acknowledgeFailure", message: "An issue occured while trying to create your folder." });
    }
  }
}

/**
 * New Implementation
 */

const RECIPIENT_TYPES = {
  ONE_GM: 0,
  ALL_GMS: 1,
  EVERYONE: 2,
}

const MESSAGE_TYPES = {
  COMMAND: 0,
  REQUEST: 1,
  RESPONSE: 2,
  RESULT: 3,
  EXCEPTION: 4,
  UNREGISTERED: 5,
} as const

export class SocketManagerPTR2e {
  readonly modules: Map<string, SocketPTR2e>;
  readonly system: SocketPTR2e
  errors = {
    PTR2eSocketError,
    PTR2eSocketInternalError,
    PTR2eSocketInvalidUserError,
    PTR2eSocketNoGMConnectedError,
    PTR2eSocketRemoteException,
    PTR2eSocketUnregisteredHandlerError
  } as const;

  constructor() {
		this.modules = new Map();
		this.system = this.registerSystem("ptr2e")!;
	}

  /**
   * Register or get a registered socket for a module. Note that your module needs to have '"socket":true' in its manifest and the module needs to be active, otherwise the registration will fail and an error will be logged.
   * @param moduleName your module id
   * @returns Instance of your Socket
   */
	public registerModule(moduleName: string) {
		const existingSocket = this.modules.get(moduleName);
		if (existingSocket)
			return existingSocket;
		const module = game.modules.get(moduleName);
		if (!module?.active) {
			console.error(`PTR 2e Socket Manager | Someone tried to register module '${moduleName}', but no module with that name is active. As a result the registration request has been ignored.`);
			return undefined;
		}
		if (!module.socket) {
			console.error(`PTR 2e Socket Manager | Failed to register socket for module '${moduleName}'. Please set '"socket":true' in your manifset and restart foundry (you need to reload your world - simply reloading your browser won't do).`);
			return undefined;
		}
		const newSocket = new SocketPTR2e(moduleName, "module");
		this.modules.set(moduleName, newSocket);
		return newSocket;
	}

	private registerSystem(systemId: string) {
		if (game.system.id !== systemId) {
			console.error(`PTR 2e Socket Manager | Someone tried to register system '${systemId}', but that system isn't active. As a result the registration request has been ignored.`);
			return undefined;
		}
		if (!game.system.socket) {
			console.error(`PTR 2e Socket Manager | Failed to register socket for system '${systemId}'. Please set '"socket":true' in your manifest and restart foundry (you need to reload your world - simply reloading your browser won't do).`);
		}
		return new SocketPTR2e(systemId, "system");
	}
}

export class SocketPTR2e {
  functions: Map<string, Function>;
  socketName: string;
  pendingRequests: Map<string, SocketPendingRequest>;

  constructor(moduleName: string, moduleType: string) {
    this.functions = new Map();
    this.socketName = `${moduleType}.${moduleName}`;
    this.pendingRequests = new Map();
    game.socket.on(this.socketName, this._onSocketReceived.bind(this));
  }

  /**
   * Register a socket request handler function under a specific name.
   * @param name Name of the to be registered socket request handler
   * @param func Function handler for this type of socket request
   * @returns 
   */
  register(name: string, func: Function) {
    if (!(func instanceof Function)) {
      console.error(`PTR 2e Socket Manager | Cannot register non-function as socket handler for '${name}' for '${this.socketName}'.`);
      return;
    }
    if (this.functions.has(name)) {
      console.warn(`PTR 2e Socket Manager | Function '${name}' is already registered for '${this.socketName}'. Ignoring registration request.`);
      return;
    }
    this.functions.set(name, func);
  }

  /**
   * Execute the requested handler as GM. If the current user is a GM, the handler will be executed locally, otherwise a request will be sent to one of the connected GMs to execute the handler.
   * @param handler Name of a socket request handler or the handler function itself.
   * @param args Arguments to pass to the handler function.
   * @returns A promise that resolves with the result of the handler function.
   */
  async executeAsGM<T extends object = object>(handler: string | Function, ...args: unknown[]): Promise<T> {
    const [name, func] = this._resolveFunction(handler);
    if (game.user.isGM) {
      return this._executeLocal<T>(func, ...args);
    }
    else {
      if (!game.users.activeGM) {
        throw new PTR2eSocketNoGMConnectedError(`Could not execute handler '${name}' (${func.name}) as GM, because no GM is connected.`);
      }
      return this._sendRequest<T>(name, args, RECIPIENT_TYPES.ONE_GM);
    }
  }

  /**
   * Execute the requested handler as a specific user. If the requested user is the current user, the handler will be executed locally, otherwise a request will be sent to the requested user to execute the handler.
   * @param handler Name of a socket request handler or the handler function itself.
   * @param userId ID of the user to execute the handler as.
   * @param args Arguments to pass to the handler function.
   * @returns A promise that resolves with the result of the handler function.
   */
  async executeAsUser<T extends object = object>(handler: string | Function, userId: string, ...args: unknown[]): Promise<T> {
    const [name, func] = this._resolveFunction(handler);
    if (userId === game.userId)
      return this._executeLocal<T>(func, ...args);
    const user = game.users.get(userId);
    if (!user)
      throw new PTR2eSocketInvalidUserError(`No user with id '${userId}' exists.`);
    if (!user.active)
      throw new PTR2eSocketInvalidUserError(`User '${user.name}' (${userId}) is not connected.`);
    return this._sendRequest<T>(name, args, [userId]);
  }

  /**
   * Execute the requested handler for all users. If the current user is included in the recipients, the handler will be executed locally, otherwise a request will be sent to all recipients to execute the handler.
   * @param handler Name of a socket request handler or the handler function itself.
   * @param args Arguments to pass to the handler function.
   */
  executeForAllGMs(handler: string | Function, ...args: unknown[]) {
    const [name, func] = this._resolveFunction(handler);
    this._sendCommand(name, args, RECIPIENT_TYPES.ALL_GMS);
    if (game.user.isGM) {
      try {
        this._executeLocal(func, ...args);
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Execute the requested handler for all other GMs. If the current user is included in the recipients, the handler will not be executed locally, otherwise a request will be sent to all other GMs to execute the handler.
   * @param handler Name of a socket request handler or the handler function itself.
   * @param args Arguments to pass to the handler function.
   */
  executeForOtherGMs(handler: string | Function, ...args: unknown[]) {
    const [name,] = this._resolveFunction(handler);
    this._sendCommand(name, args, RECIPIENT_TYPES.ALL_GMS);
  }

  /**
   * Execute the requested handler for all users. If the current user is included in the recipients, the handler will be executed locally, otherwise a request will be sent to all recipients to execute the handler.
   * @param handler Name of a socket request handler or the handler function itself.
   * @param args Arguments to pass to the handler function.
   */
  executeForEveryone(handler: string | Function, ...args: unknown[]) {
    const [name, func] = this._resolveFunction(handler);
    this._sendCommand(name, args, RECIPIENT_TYPES.EVERYONE);
    try {
      this._executeLocal(func, ...args);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Execute the requested handler for all other users. If the current user is included in the recipients, the handler will not be executed locally, otherwise a request will be sent to all recipients to execute the handler.
   * @param handler Name of a socket request handler or the handler function itself.
   * @param args Arguments to pass to the handler function.
   */
  executeForOthers(handler: string | Function, ...args: unknown[]) {
    const [name,] = this._resolveFunction(handler);
    this._sendCommand(name, args, RECIPIENT_TYPES.EVERYONE);
  }

  /**
   * Execute the requested handler for specific users. If any of the requested users is the current user, the handler will be executed locally, otherwise a request will be sent to all requested users to execute the handler.
   * @param handler Name of a socket request handler or the handler function itself.
   * @param recipients Array of user ids or a single user id to execute the handler for.
   * @param args Arguments to pass to the handler function.
   */
  executeForUsers(handler: string | Function, recipients: string[], ...args: unknown[]) {
    if (!(recipients instanceof Array))
      throw new TypeError("Recipients parameter must be an array of user ids.");
    const [name, func] = this._resolveFunction(handler);
    const currentUserIndex = recipients.indexOf(game.userId);
    if (currentUserIndex >= 0)
      recipients.splice(currentUserIndex, 1);
    this._sendCommand(name, args, recipients);
    if (currentUserIndex >= 0) {
      try {
        this._executeLocal(func, ...args);
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  private _sendRequest<T extends object = object>(handlerName: string, args: unknown[], recipient: ReciepientType): Promise<T> {
    const message: SocketMessage = {
      handlerName,
      args,
      recipient,
      id: foundry.utils.randomID(),
      type: MESSAGE_TYPES.REQUEST
    };
    const promise = new Promise((resolve, reject) => this.pendingRequests.set(message.id, { handlerName, resolve, reject, recipient }));
    game.socket.emit(this.socketName, message);
    return promise as Promise<T>;
  }

  private _sendCommand(handlerName: string, args: unknown[], recipient: ReciepientType) {
    const message: SocketMessage = { handlerName, args, recipient, type: MESSAGE_TYPES.COMMAND };
    game.socket.emit(this.socketName, message);
  }

  private _sendResult(id: string, result: unknown) {
    const message: SocketResponseMessage = { id, result, type: MESSAGE_TYPES.RESULT };
    game.socket.emit(this.socketName, message);
  }

  private _sendError(id: string, type: SocketMessageType) {
    const message: SocketMessage = { id, type, userId: game.userId };
    game.socket.emit(this.socketName, message);
  }

  private _executeLocal<T extends object = object>(func: Function, ...args: unknown[]): T {
    const socketdata = { userId: game.userId };
    return func.call({ socketdata }, ...args) as T;
  }

  private _resolveFunction(func: string | Function): [string, Function] {
    if (func instanceof Function) {
      const entry = Array.from(this.functions.entries()).find(([, val]) => val === func);
      if (!entry)
        throw new PTR2eSocketUnregisteredHandlerError(`Function '${func.name}' has not been registered as a socket handler.`);
      return [entry[0], func];
    }
    else {
      const fn = this.functions.get(func);
      if (!fn)
        throw new PTR2eSocketUnregisteredHandlerError(`No socket handler with the name '${func}' has been registered.`)
      return [func, fn];
    }
  }

  private _onSocketReceived(message: SocketMessage, senderId: string) {
    if (message.type === MESSAGE_TYPES.COMMAND || message.type === MESSAGE_TYPES.REQUEST)
      this._handleRequest(message as SocketRequestMessage | SocketCommandMessage, senderId);
    else
      this._handleResponse(message as SocketResponseMessage, senderId);
  }

  private async _handleRequest(message: SocketRequestMessage | SocketCommandMessage, senderId: string) {
    const { handlerName, args, recipient, id, type } = message;
    // Check if we're the recipient of the received message. If not, return early.
    if (recipient instanceof Array) {
      if (!recipient.includes(game.userId))
        return;
    }
    else {
      switch (recipient) {
        case RECIPIENT_TYPES.ONE_GM:
          if (!game.users.activeGM?.isSelf)
            return;
          break;
        case RECIPIENT_TYPES.ALL_GMS:
          if (!game.user.isGM)
            return;
          break;
        case RECIPIENT_TYPES.EVERYONE:
          break;
        default:
          console.error(`Unkown recipient '${recipient}' when trying to execute '${handlerName}' for '${this.socketName}'. This should never happen. If you see this message, please open an issue in the bug tracker of the PTR 2e Socket Manager repository.`);
          return;
      }
    }
    let name, func;
    try {
      [name, func] = this._resolveFunction(handlerName);
    }
    catch (e) {
      if (e instanceof PTR2eSocketUnregisteredHandlerError && type === MESSAGE_TYPES.REQUEST) {
        this._sendError(id!, MESSAGE_TYPES.UNREGISTERED);
      }
      throw e;
    }
    const socketdata = { userId: senderId };
    const _this = { socketdata };
    if (type === MESSAGE_TYPES.COMMAND) {
      func.call(_this, ...args);
    }
    else {
      let result;
      try {
        result = await func.call(_this, ...args);
      }
      catch (e) {
        console.error(`An exception occured while executing handler '${name}'.`);
        this._sendError(id!, MESSAGE_TYPES.EXCEPTION);
        throw e;
      }
      this._sendResult(id!, result);
    }
  }

  private _handleResponse(message: SocketResponseMessage, senderId: string) {
    const { id, result, type } = message;
    const request = this.pendingRequests.get(id);
    if (!request)
      return;
    if (!this._isResponseSenderValid(senderId, request.recipient)) {
      console.warn("PTR 2e Socket Manager | Dropped a response that was received from the wrong user. This means that either someone is inserting messages into the socket or this is a PTR 2e Socket Manager issue. If the latter is the case please file a bug report in the PTR 2e Socket Manager repository.")
      console.info(senderId, request.recipient);
      return;
    }
    switch (type) {
      case MESSAGE_TYPES.RESULT:
        request.resolve(result);
        break;
      case MESSAGE_TYPES.EXCEPTION:
        request.reject(new PTR2eSocketRemoteException(`An exception occured during remote execution of handler '${request.handlerName}'. Please see ${game.users.get(message.userId)?.name}'s error console for details.`));
        break;
      case MESSAGE_TYPES.UNREGISTERED:
        request.reject(new PTR2eSocketUnregisteredHandlerError(`Executing the handler '${request.handlerName}' has been refused by ${game.users.get(message.userId)?.name}'s client, because this handler hasn't been registered on that client.`));
        break;
      default:
        request.reject(new PTR2eSocketInternalError(`Unknown result type '${type}' for handler '${request.handlerName}'. This should never happen. If you see this message, please open an issue in the bug tracker of the PTR 2e Socket Manager repository.`));
        break;
    }
    this.pendingRequests.delete(id);
  }

  private _isResponseSenderValid(senderId: string, recipients: ReciepientType) {
    if (recipients === RECIPIENT_TYPES.ONE_GM && game.users.get(senderId)?.isGM)
      return true;
    if (recipients instanceof Array && recipients.includes(senderId))
      return true;
    return false;
  }
}

function handleUserActivity(user: User, active: boolean) {
  if (!active) {
    const sockets: SocketPTR2e[] = [...Array.from(game.ptr.sockets.modules.values()), game.ptr.sockets.system];
    // Reject all promises that are still waiting for a response from this player
    for (const socket of sockets) {
      const failedRequests = Array.from(socket.pendingRequests.entries()).filter(([, request]) => {
        const recipient = request.recipient;
        const handlerName = request.handlerName;
        if (recipient === RECIPIENT_TYPES.ONE_GM) {
          if (!game.users.activeGM) {
            request.reject(new PTR2eSocketNoGMConnectedError(`Could not execute handler '${handlerName}' as GM, because all GMs disconnected while the execution was being dispatched.`));
            return true;
          }
        }
        else if (recipient instanceof Array) {
          if (recipient.includes(user.id)) {
            request.reject(new PTR2eSocketInvalidUserError(`User '${user.name}' (${user.id}) disconnected while handler '${handlerName}' was being dispatched.`));
            return true;
          }
        }
        return false;
      });
      for (const [id,] of failedRequests) {
        socket.pendingRequests.delete(id);
      }
    }
  }
}

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

type SocketMessage = SocketRequestMessage | SocketCommandMessage | SocketResponseMessage;
type SocketMessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];
type ReciepientType = (typeof RECIPIENT_TYPES)[keyof typeof RECIPIENT_TYPES] | string[] | string;

interface SocketMessageBase {
  handlerName?: string;
  args?: unknown[];
  type: SocketMessageType;
  recipient?: ReciepientType;
  id?: string;
}

interface SocketRequestMessage extends SocketMessageBase {
  handlerName: string;
  args: unknown[];
  recipient: ReciepientType;
  id: string;
  type: SocketMessageType;
}

interface SocketCommandMessage extends SocketMessageBase {
  handlerName: string;
  args: unknown[];
  recipient: ReciepientType;
  type: SocketMessageType;
  id?: never;
}

interface SocketResponseMessage extends SocketMessageBase {
  handlerName?: never;
  id: string;
  result?: unknown;
  type: SocketMessageType;
  userId?: string;
}

interface SocketPendingRequest {
  handlerName: string;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  recipient: ReciepientType;
}