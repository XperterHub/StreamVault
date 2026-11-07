"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  src: string;
  isAlwaysDisplayed: boolean;
};

const Backdrop = ({ src, isAlwaysDisplayed }: Props) => {
  const [isDisplayed, setIsDisplayed] = useState(true);

  useEffect(() => {
    const firstTimeout = setTimeout(() => {
      if (isAlwaysDisplayed) {
        setIsDisplayed(false);
      }
    }, 10000);

    const secondTimeout = setTimeout(() => {
      if (isAlwaysDisplayed) {
        setIsDisplayed(true);
      }
    }, 60000);

    return () => {
      clearTimeout(firstTimeout);
      clearTimeout(secondTimeout);
    };
  }, [isAlwaysDisplayed]);

  const imageSrc = !src
    ? "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80"
    : src.startsWith("http")
    ? src
    : `https://image.tmdb.org/t/p/original${src}`;

  return (
    <>
      {isDisplayed ? (
        <div className="absolute inset-0 bg-background-dark" />
      ) : null}
      <Image
        src={imageSrc}
        alt="Showcase Backdrop"
        fill
        sizes="100vw"
        priority
        className={`${
          isDisplayed ? "opacity-100" : "desktop:opacity-0"
        } object-cover brightness-[105%] transition-all duration-1000 ease-in`}
      />
    </>
  );
};

export default Backdrop;
