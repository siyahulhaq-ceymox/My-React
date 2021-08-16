import { createElement, useEffect } from "../MyReact/myReact.js";

function Name({ item }) {
  
  return createElement("div", {
    className: "col",
    children: createElement("div", {
      className: "card",
      children: [
        createElement("p", { children: "Name: " + item.name }),
        createElement("p", { children: "Phone: " + item.phone }),
        createElement("p", { children: "Email: " + item.email }),
        createElement("p", { children: "User Name: " + item.username }),
      ]
    })
  });
}

export default Name;
