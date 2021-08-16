import { createElement, useEffect, useState } from "../MyReact/myReact.js";
import Name from "./Name.js";

export default function App() {
  const [names, setNames] = useState([]);
  const [number, setNumber] = useState(0);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((json) => {
        setNames(json);
      });
  }, []);

  return createElement("div", {
    children: [
      createElement("h1", { children: number }),
      createElement("div", {
        className: "container",
        children: createElement("div", {
          className: "row",
          children: names?.map((item) => Name({ item: item })),
        }),
      }),
      createElement("button", {
        children: "click",
        onClick: () => {
          setNumber((prev) => ++prev);
        },
      }),
    ],
  });
}
