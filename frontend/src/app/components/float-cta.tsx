"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const HIDE_ON = ["/register", "/sign-in", "/sign-up", "/admin"];

export function FloatCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const hidden = HIDE_ON.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  useEffect(() => {
    if (hidden) {
      setVisible(false);
      return;
    }

    const onScroll = () => {
      setVisible(window.scrollY > 520);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hidden]);

  if (hidden || !visible) {
    return null;
  }

  return (
    <Link className="btn btn-primary float-cta h-11 px-5 text-sm" href="/register">
      Register
    </Link>
  );
}
