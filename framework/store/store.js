/**
 * OldSchoolFrontFrame (OLS)
 * © 2025 Cynchro. All rights reserved.
 */

import { createReactiveState } from "../core/reactivity.js";

export function createStore(initialState = {}, actions = {}) {
  const reactive = createReactiveState(initialState);

  const getState = () => reactive.state;

  const setState = (path, value) => {
    if (!path || typeof path !== "string") {
      throw new Error("setState(path, value): path must be a non-empty string.");
    }

    const keys = path.split(".");
    const lastKey = keys.pop();
    let cursor = reactive.state;

    keys.forEach((key) => {
      if (cursor[key] == null || typeof cursor[key] !== "object") {
        cursor[key] = {};
      }
      cursor = cursor[key];
    });

    cursor[lastKey] = value;
  };

  const patchState = (partialState = {}) => {
    Object.keys(partialState).forEach((key) => {
      reactive.state[key] = partialState[key];
    });
  };

  const wrappedActions = Object.keys(actions).reduce((acc, key) => {
    acc[key] = (...args) => actions[key]({
      state: reactive.state,
      getState,
      setState,
      patchState
    }, ...args);
    return acc;
  }, {});

  return {
    state: reactive.state,
    getState,
    setState,
    patchState,
    actions: wrappedActions,
    subscribe: reactive.subscribe,
    subscribePath: reactive.subscribePath
  };
}
