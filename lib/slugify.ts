export const slugify = (str: string) => {
    return str
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")       // spaces → dash
      .replace(/[^\w\-]+/g, "")   // remove non-word chars
      .replace(/\-\-+/g, "-")     // collapse multiple dashes
      .replace(/^-+/, "")         // trim dash from start
      .replace(/-+$/, "");        // trim dash from end
  };
  