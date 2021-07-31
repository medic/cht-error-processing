class MedicError extends Error {
    constructor(message, stack) {
      super(message);
      this.stack = stack;
    }
  }

  module.exports = MedicError;