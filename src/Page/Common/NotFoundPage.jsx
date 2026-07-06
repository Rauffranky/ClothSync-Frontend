import { ArrowLeft, Home, Radar, RadioTower, Satellite, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/UI/Button";
import { usePageMeta } from "../../Hooks/usePageMeta";

const NotFoundPage = () => {
  const navigate = useNavigate();
  usePageMeta({
    title: "404 - RFID Laundry",
    meta: [
      {
        name: "description",
        content: "The requested RFID Laundry page could not be found.",
      },
    ],
  });

  return (
    <>
      <style>
        {`
          @keyframes nf-pulse {
            0%, 100% { opacity: 0.32; transform: translate(-50%, -50%) scale(0.92); }
            50% { opacity: 0.88; transform: translate(-50%, -50%) scale(1.08); }
          }

          @keyframes nf-orbit {
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }

          @keyframes nf-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }

          @keyframes nf-glitch {
            0%, 100% { text-shadow: 0 0 28px rgba(110,231,242,0.3); }
            30% { text-shadow: 4px 0 0 rgba(20,184,166,0.5), -5px 0 0 rgba(96,165,250,0.35); }
            32% { text-shadow: -3px 0 0 rgba(110,231,242,0.55), 5px 0 0 rgba(20,184,166,0.25); }
            34% { text-shadow: 0 0 32px rgba(110,231,242,0.42); }
          }
        `}
      </style>

      <main className="relative isolate h-screen max-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.2),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(96,165,250,0.16),transparent_36%),linear-gradient(135deg,var(--bg-dark-start)_0%,var(--bg-dark-middle)_48%,var(--bg-dark-end)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(110,231,242,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,242,0.055)_1px,transparent_1px)] bg-size-[42px_42px] opacity-45" />

        <span className="absolute left-[8%] top-[18%] h-28 w-px rotate-45 bg-[linear-gradient(transparent,var(--color-aqua-mist),transparent)] opacity-45" />
        <span className="absolute right-[9%] top-[18%] h-32 w-px -rotate-45 bg-[linear-gradient(transparent,var(--color-sky-blue),transparent)] opacity-35" />

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-155 w-155 rounded-full border border-[rgba(110,231,242,0.1)]"
          style={{ animation: "nf-pulse 3.5s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-115 w-115 rounded-full border border-[rgba(110,231,242,0.18)]"
          style={{ animation: "nf-pulse 3.5s ease-in-out infinite 220ms" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-75 w-75 rounded-full border border-[rgba(20,184,166,0.24)]"
          style={{ animation: "nf-pulse 3.5s ease-in-out infinite 440ms" }}
        />

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-500 w-500"
          style={{ animation: "nf-orbit 13s linear infinite" }}
        >
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-(--color-aqua-mist) shadow-[0_0_24px_var(--color-aqua-mist)]" />
          <span className="absolute bottom-10 right-10 h-4 w-4 rounded-full bg-(--color-aurora-teal) shadow-[0_0_26px_var(--color-aurora-teal)]" />
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-165 w-165"
          style={{ animation: "nf-orbit 19s linear infinite reverse" }}
        >
          <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-(--color-sky-blue) shadow-[0_0_22px_var(--color-sky-blue)]" />
          <span className="absolute left-16 top-20 h-2 w-2 rounded-full bg-(--color-aqua-mist) shadow-[0_0_18px_var(--color-aqua-mist)]" />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-4xl border border-[rgba(110,231,242,0.24)] bg-[rgba(4,24,31,0.68)] text-(--color-aqua-mist) shadow-[0_0_42px_rgba(110,231,242,0.24),inset_0_1px_0_rgba(110,231,242,0.16)] backdrop-blur-xl">
          <Radar size={48} />
        </div>

        <div
          className="pointer-events-none absolute right-12 top-12 rounded-2xl border border-[rgba(96,165,250,0.24)] bg-[rgba(8,42,47,0.3)] p-4 text-(--color-sky-blue) backdrop-blur-xl"
          style={{ animation: "nf-float 4.8s ease-in-out infinite" }}
        >
          <Satellite size={30} />
        </div>
        <div
          className="pointer-events-none absolute bottom-14 left-1/2 rounded-2xl border border-[rgba(20,184,166,0.24)] bg-[rgba(8,42,47,0.3)] p-4 text-(--color-aurora-teal) backdrop-blur-xl"
          style={{ animation: "nf-float 5.2s ease-in-out infinite 500ms" }}
        >
          <RadioTower size={30} />
        </div>
        <div className="pointer-events-none absolute bottom-10 right-10 hidden items-center gap-2 rounded-full border border-[rgba(110,231,242,0.18)] bg-[rgba(8,42,47,0.34)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-(--color-aqua-mist) backdrop-blur-xl md:inline-flex">
          <Zap size={15} />
          Recalibrate
        </div>

        <section className="relative z-10 flex h-full items-center justify-center px-5 py-6">
          <div className="flex max-w-4xl flex-col items-center text-center">
            <h1
              className="m-0 text-[clamp(6rem,15vw,12rem)] font-black leading-none"
              style={{
                animation: "nf-glitch 3.4s ease-in-out infinite",
                background:
                  "linear-gradient(135deg, var(--color-aqua-mist), var(--theme-text-primary) 42%, var(--color-aurora-teal))",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              404
            </h1>
            
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-(--theme-text-secondary) md:text-base md:leading-7">
              The requested page is not mapped in the current navigation
              network. Recalibrate to the home base or return to the previous
              screen.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button
                leftIcon={<Home size={17} />}
                onClick={() => navigate("/")}
                rounded="14px"
                size="md"
                type="button"
                variant="primary"
              >
                Go Home
              </Button>
              <Button
                leftIcon={<ArrowLeft size={17} />}
                onClick={() => navigate(-1)}
                rounded="14px"
                size="md"
                type="button"
                variant="secondary"
              >
                Go Back
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default NotFoundPage;
