"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            backgroundColor: "#020617",
            color: "#ffffff",
            padding: "1.5rem",
            fontFamily: "sans-serif",
          }}
        >
          <section style={{ maxWidth: "32rem", textAlign: "center" }}>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#fca5a5",
              }}
            >
              Afakpress
            </p>
            <h1
              style={{
                marginTop: "1rem",
                fontSize: "1.875rem",
                fontWeight: 900,
              }}
            >
              حدث خطأ غير متوقع
            </h1>
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.875rem",
                lineHeight: "1.5rem",
                color: "#cbd5e1",
              }}
            >
              يرجى إعادة المحاولة لتحديث بيانات الصفحة.
            </p>
            <button
              style={{
                marginTop: "1.5rem",
                backgroundColor: "#ffffff",
                padding: "0.75rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 900,
                color: "#020617",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => reset()}
              type="button"
            >
              إعادة المحاولة
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
