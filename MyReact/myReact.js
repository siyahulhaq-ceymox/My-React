let globalId = 0;
let globalParent;
const componentState = new Map();

export const useState = (initialState) => {
  const id = globalId;
  const parent = globalParent;
  globalId++;
  return (() => {
    const { cache } = componentState.get(parent);
    if (cache[id] == null) {
      cache[id] = {
        value:
          typeof initialState === "function" ? initialState() : initialState,
      };
    }

    const setState = (state) => {
      const { component, props } = componentState.get(parent);
      let newVal;
      if (typeof state === "function") {
        newVal = state(cache[id].value);
      } else {
        newVal = state;
      }
      if (newVal !== cache[id].value) {
        cache[id].value = newVal;
        render(component, props, parent);
      }
    };

    return [cache[id].value, setState];
  })();
};

export const useEffect = (callback, deps) => {
  const id = globalId;
  const parent = globalParent;
  globalId++;
  return (() => {
    const { cache } = componentState.get(parent);
    if (cache[id] == null) {
      cache[id] = { dependecies: undefined, name: "useEffect", callback, deps };
    } else {
      const dependeciesChanged =
      deps == null ||
      deps.some((dependecy, i) => {
        return cache[id].dependecies == null || JSON.stringify(cache[id].dependecies[i]) !== JSON.stringify(dependecy);
      });
      if(dependeciesChanged) {
        cache[id].deps = deps;
        cache[id].callback = callback;
      }
    }
  })();
};

export const useMemo = (callback, deps) => {
  const id = globalId;
  const parent = globalParent;
  globalId++;

  return (() => {
    const { cache } = componentState.get(parent);
    if (cache[id] == null) {
      cache[id] = { dependecies: undefined };
    }

    const dependeciesChanged =
      deps == null ||
      deps.some((dependecy, i) => {
        return (
          cache[id].dependecies == null ||
          cache[id].dependecies[i] !== dependecy
        );
      });

    if (dependeciesChanged) {
      if (cache[id].cleanup != null) cache[id].cleanup();
      cache[id].value = callback();
      cache[id].dependecies = deps;
    }
    return cache[id].value;
  })();
};

export const createElement = (type, { children, onClick, className, style }) => {
  const element = document.createElement(type);
  if (onClick) element.onclick = onClick;
  if (className) element.className = className;
  if (style) element.style = style;
  
  if (typeof children !== "object") {
    element.innerHTML = children;
  } else {
    // console.log(type, children);
    element.innerHTML = "";
    if (Array.isArray(children)) {
      children.forEach((child) => element.appendChild(child));
    } else {
      element.appendChild(children);
    }
  }
  return element;
};

export function render(component, props, parent) {
  const state = componentState.get(parent) || { cache: [], render: 0 };
  const render = state.render + 1;
  state.component = component;
  state.props = props;
  state.render = render;
  componentState.set(parent, state);
  globalParent = parent;
  const output = component(props);
  const newState = componentState.get(parent);
  parent.innerHTML = "";
  parent.appendChild(output);
  globalId = 0;
  newState.cache.forEach((item) => {
    if (item.name === "useEffect") {
      const { deps, callback } = item;
      if (newState.render === 1 && !deps?.length) {
        callback();
        return;
      }
      const dependeciesChanged =
      deps == null ||
      deps.some((dependecy, i) => {
        return item.dependecies == null || JSON.stringify(item.dependecies[i]) !== JSON.stringify(dependecy);
      });
      
      if (dependeciesChanged) {
        if (item.cleanup != null) item.cleanup();
        item.cleanup = callback();
        item.dependecies = deps;
      }
    }
  });
}
