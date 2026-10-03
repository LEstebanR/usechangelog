import { Wordmark } from "../wordmark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col bg-wash">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-(--header-h) max-w-6xl items-center px-6">
          <Wordmark />
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 py-16 sm:items-center">
        {children}
      </main>
    </div>
  );
}
