import { SiteHeader } from "../wordmark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col bg-wash">
      <SiteHeader />
      <main className="flex flex-1 items-start justify-center px-6 py-16 sm:items-center">
        {children}
      </main>
    </div>
  );
}
