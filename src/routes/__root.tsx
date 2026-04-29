import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pulse CRM — Modern lead management" },
      { name: "description", content: "A premium, minimal CRM for tracking and converting client leads. Built for startups and agencies." },
      { property: "og:title", content: "Pulse CRM — Modern lead management" },
      { property: "og:description", content: "A premium, minimal CRM for tracking and converting client leads. Built for startups and agencies." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Pulse CRM — Modern lead management" },
      { name: "twitter:description", content: "A premium, minimal CRM for tracking and converting client leads. Built for startups and agencies." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/879b8af5-f532-4bb4-a0bb-d4c413bd95c4/id-preview-0cbbe689--adf08db8-528e-4c4c-a33e-969e617c4c82.lovable.app-1777384079603.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/879b8af5-f532-4bb4-a0bb-d4c413bd95c4/id-preview-0cbbe689--adf08db8-528e-4c4c-a33e-969e617c4c82.lovable.app-1777384079603.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
