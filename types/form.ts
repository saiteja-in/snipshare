export const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "CSS",
  "C++",
  "Ruby",
  "Go",
  "Rust",
  "PHP",
  "Swift",
];

export const FRAMEWORKS = [
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "Nuxt",
  "Svelte",
  "Express",
  "Django",
  "Spring",
  "Laravel",
];

export const CATEGORIES = [
  "Utility Functions",
  "Components",
  "Hooks",
  "Algorithms",
  "Data Structures",
  "API",
  "Database",
  "Authentication",
  "Testing",
  "DevOps",
];

// Templates for StackBlitz
export const TEMPLATES = [
  { name: "angular-cli", label: "Angular" },
  { name: "create-react-app", label: "React" },
  { name: "html", label: "HTML" },
  { name: "javascript", label: "JavaScript" },
  { name: "polymer", label: "Polymer" },
  { name: "typescript", label: "TypeScript" },
  { name: "vue", label: "Vue" },
  { name: "node", label: "Node.js" },
];

// Map languages to appropriate StackBlitz templates
export const LANGUAGE_TO_TEMPLATE_MAP: Record<string, string> = {
  "JavaScript": "javascript",
  "TypeScript": "typescript",
  "HTML": "html",
  "CSS": "html", // CSS usually goes with HTML
  "Python": "node", // Fallback to node for Python
  "Java": "node", // Fallback to node for Java
  "C++": "node", // Fallback to node for C++
  "Ruby": "node", // Fallback to node for Ruby
  "Go": "node", // Fallback to node for Go
  "Rust": "node", // Fallback to node for Rust
  "PHP": "node", // Fallback to node for PHP
  "Swift": "node", // Fallback to node for Swift
};