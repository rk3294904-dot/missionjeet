import { useReducer, useEffect, useRef, useCallback } from "react";

// fetchState reducer: idle -> loading -> success | error
const initialState = { status: "idle", data: null, error: null };

function reducer(state, action) {
  switch (action.type) {
    case "load":
      return { status: "loading", data: null, error: null };
    case "success":
      return { status: "success", data: action.data, error: null };
    case "error":
      return { status: "error", data: null, error: action.error };
    default:
      return state;
  }
}

/**
 * useApi — runs an async fetcher and exposes its state.
 * @param {() => Promise} fetcher  returns the data
 * @param {Array} deps            re-run when these change
 */
export function useApi(fetcher, deps = []) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fnRef = useRef(fetcher);
  fnRef.current = fetcher;

  const run = useCallback(async () => {
    dispatch({ type: "load" });
    try {
      const data = await fnRef.current();
      dispatch({ type: "success", data });
    } catch (e) {
      dispatch({ type: "error", error: e?.message || "Something went wrong" });
    }
  }, []);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: run };
}