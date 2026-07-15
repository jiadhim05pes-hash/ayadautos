import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChatbotSlot } from "@/components/site/ChatbotSlot";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ayad Automotives — Premium Japanese Imports & Executive Vehicles" },
      { name: "description", content: "Premium vehicle dealership on Ngong Road, Nairobi. Direct Japanese imports, executive SUVs, bank & SACCO financing, trade-ins and vehicle sourcing." },
      { name: "author", content: "Ayad Automotives" },
      { name: "theme-color", content: "#0F172A" },
      { property: "og:site_name", content: "Ayad Automotives" },
      { property: "og:title", content: "Ayad Automotives — Premium Japanese Imports & Executive Vehicles" },
      { property: "og:description", content: "Premium vehicle dealership on Ngong Road, Nairobi. Direct Japanese imports, executive SUVs, bank & SACCO financing, trade-ins and vehicle sourcing." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_KE" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ayad Automotives — Premium Japanese Imports & Executive Vehicles" },
      { name: "twitter:description", content: "Premium vehicle dealership on Ngong Road, Nairobi. Direct Japanese imports, executive SUVs, bank & SACCO financing, trade-ins and vehicle sourcing." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9707383d-619c-4ccd-bc88-770fbd193a9c/id-preview-d748c79c--3b7338b5-d0ac-4b9a-9cfa-a7ffd31131e8.lovable.app-1783935952709.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9707383d-619c-4ccd-bc88-770fbd193a9c/id-preview-d748c79c--3b7338b5-d0ac-4b9a-9cfa-a7ffd31131e8.lovable.app-1783935952709.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          name: "Ayad Automotives",
          description: "Premium Japanese imports and executive vehicle dealership in Nairobi, Kenya.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Ngong Road",
            addressLocality: "Nairobi",
            addressCountry: "KE",
          },
          telephone: "+254768487356",
          areaServed: "KE",
          priceRange: "$$$",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-dvh">
        <Header />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
        <ChatbotSlot />
        <WhatsAppFab />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
