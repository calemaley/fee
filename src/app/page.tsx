"use client"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold">
          Access Restricted
        </p>
        <p className="text-xs text-muted-foreground/50 max-w-xs mx-auto">
          Please use your institution-specific URL to access the portal. Contact your administrator if you do not have the link.
        </p>
      </div>
    </div>
  );
}
