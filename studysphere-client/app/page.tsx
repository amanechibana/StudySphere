"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import useAuthStore from "./stores/authStore";

const features = [
  {
    title: "Find focused study rooms",
    description:
      "Browse open rooms by course, topic, and vibe so you can join a session that matches the work in front of you.",
    image: "/rooms.jpg",
  },
  {
    title: "Create your own space",
    description:
      "Start a public or private room, set the capacity, and invite classmates into a quieter place to get things done.",
    image: "/create_room.jpg",
  },
  {
    title: "Chat while you study",
    description:
      "Keep questions, resources, and quick check-ins in one room while the session timer keeps everyone moving.",
    image: "/chatroom.jpg",
  },
  {
    title: "Sketch ideas together",
    description:
      "Use the shared drawing board to map problems, diagram concepts, and explain tricky ideas visually in real time.",
    image: "/canvas.jpg",
  },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const primaryHref = user ? "/rooms" : "/signup";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <section className="max-w-6xl mx-auto px-6 pt-14 pb-10 md:pt-20 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-10 lg:gap-14 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-espresso-muted uppercase mb-4">
                Collaborative study rooms
              </p>
              <h1 className="text-5xl md:text-6xl font-semibold text-espresso tracking-tight leading-[1.05] mb-5">
                StudySphere
              </h1>
              <p className="font-serif italic text-2xl md:text-3xl text-caramel mb-5">
                Find your focus. Your study rooms are waiting.
              </p>
              <p className="text-base md:text-lg text-espresso-muted leading-7 max-w-xl mb-8">
                StudySphere helps classmates gather around courses, create
                focused rooms, and stay connected while they work through the
                hard parts together.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={primaryHref}
                  className="bg-espresso text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-espresso-muted transition-colors text-center"
                >
                  {user ? "Open study rooms" : "Get started"}
                </Link>
                {!user && (
                  <Link
                    href="/login"
                    className="border border-border text-espresso text-sm font-semibold px-5 py-3 rounded-lg hover:bg-surface transition-colors text-center"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>

            <div className="relative min-h-[360px] md:min-h-[440px]">
              <div className="absolute left-0 top-6 w-[74%] overflow-hidden rounded-lg border border-border bg-surface-card shadow-sm">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/rooms.jpg"
                    alt="StudySphere room browsing"
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 1024px) 34rem, 90vw"
                  />
                </div>
              </div>
              <div className="absolute right-0 bottom-0 w-[66%] overflow-hidden rounded-lg border border-border bg-surface-card shadow-md">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/create_room.jpg"
                    alt="StudySphere room creation"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 30rem, 80vw"
                  />
                </div>
              </div>
              <div className="absolute right-8 top-0 bg-surface-card border border-border rounded-lg px-4 py-3 shadow-sm">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-espresso-muted">
                  Live rooms
                </p>
                <p className="font-serif italic text-2xl text-caramel">Focus together</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-widest text-espresso-muted uppercase mb-2">
                Core functionality
              </p>
              <h2 className="text-3xl font-semibold text-espresso">
                Everything students need to meet, focus, and keep moving.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="bg-surface-card border border-border rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-espresso mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-espresso-muted leading-6">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
