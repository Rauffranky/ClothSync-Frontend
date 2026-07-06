import { useEffect } from "react";

const setAttributes = (element, attributes = {}) => {
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "id" || value === undefined || value === null) return;
    element.setAttribute(key, String(value));
  });
};

export const usePageMeta = ({ title, meta = [], link = [] } = {}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const createdMetaTags = meta.map((attributes) => {
      const element = document.createElement("meta");
      setAttributes(element, attributes);
      document.head.appendChild(element);
      return element;
    });

    const createdLinkTags = link.map((attributes) => {
      const element = document.createElement("link");
      setAttributes(element, attributes);
      document.head.appendChild(element);
      return element;
    });

    return () => {
      [...createdMetaTags, ...createdLinkTags].forEach((element) => {
        if (document.head.contains(element)) {
          document.head.removeChild(element);
        }
      });
    };
  }, [title, meta, link]);

  return null;
};

export default usePageMeta;
