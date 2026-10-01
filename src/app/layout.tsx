import type { ReactNode } from "react";

// <html> and <body> are rendered by app/[locale]/layout.tsx, which knows the language.
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
