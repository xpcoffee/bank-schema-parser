/**
 * Tries to extract and returns a message in an unkown object.
 * Returns undefiend if the message could not be found.
 * Useful for use with errors.
 */
export function tryExtractMessage(e: unknown): string | undefined {
    if(typeof e === "string") {
      return e;
    }

    if(e && typeof e === "object" && hasOwnProperty(e, "message")) {
      if(typeof e.message === "string") {
        return e.message;
      }
    }
}

/**
 * Function that allows TypeScript to know if an object has a property.
 * Useful when narrowing down unkown types.
 * 
 * Taken from https://fettblog.eu/typescript-hasownproperty/
 */
export function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}
