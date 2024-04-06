export enum RunningState {
  Idle = "IDLE",
  Running = 'RUNNING',
  Interrupted = 'INTERRUPTED',
  Completed = 'COMPLETE'
}

export enum ResultCode {
  Success = 0,
  Void = 404,
  Timeout = 504, // TODO:
}
