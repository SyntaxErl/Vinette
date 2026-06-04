import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import logo from "../assets/images/logo.png";
import heroImg from "../assets/images/login.png";

export default function Landing() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-white"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Vibrant gradient glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 opacity-20 blur-3xl" />

      {/* Floating decorative dots */}
      <div className="pointer-events-none absolute top-24 right-1/4 h-16 w-16 rounded-full bg-indigo-500 opacity-10 animate-float" />
      <div className="pointer-events-none absolute bottom-28 left-12 h-10 w-10 rounded-full bg-violet-600 opacity-15 animate-float-delay" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-6 w-6 rounded-full bg-fuchsia-500 opacity-20 animate-float" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Vinette logo" className="h-9 w-9 rounded-lg object-contain" />
          <span className="text-2xl font-bold" style={{ color: "#5b4fcf" }}>
            Vinette
          </span>
        </div>
        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className="text-sm font-semibold text-gray-600 transition hover:text-gray-900"
        >
          {isAuthenticated ? "Dashboard" : "Log In"}
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-2 lg:pt-16">
        {/* Copy + CTA */}
        <div className="animate-fadeInUp text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-purple-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Task management, all in one place
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            The all-in-one{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              task manager
            </span>{" "}
            for your whole team.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-600 lg:mx-0">
            Boards, calendar, and analytics — organize work, hit deadlines, and
            track progress without juggling five different apps.
          </p>

          {/* CTA buttons */}
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full rounded-xl px-8 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: "#5b4fcf" }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group w-full rounded-xl px-8 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:opacity-90 sm:w-auto"
                  style={{ backgroundColor: "#5b4fcf" }}
                >
                  Get Started
                  <span className="material-icons ml-1 align-middle transition-transform group-hover:translate-x-1" style={{ fontSize: "18px" }}>
                    arrow_forward
                  </span>
                </Link>
                <Link
                  to="/login"
                  className="w-full rounded-xl border border-purple-200 bg-white/80 px-8 py-4 text-center text-sm font-semibold text-purple-700 shadow-sm backdrop-blur transition hover:bg-white sm:w-auto"
                >
                  Log In
                </Link>
              </>
            )}
          </div>

          <p className="mt-5 text-sm text-gray-400">
            Free to get started • No credit card required
          </p>
        </div>

        {/* Hero image */}
        <div className="animate-fadeInUp-delay flex justify-center lg:justify-end">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-20 blur-2xl" />
            <img
              src={heroImg}
              alt="Vinette task management preview"
              className="w-full max-w-lg object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
