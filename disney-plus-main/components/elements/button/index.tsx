"use client";

import { PlayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  variant:
    | { name: "primary"; type: "watch" | "save"; isInverted: boolean }
    | { name: "secondary" };
  isFull?: boolean;
  onClick?: () => void;
};

const Button = ({ children, variant, isFull, onClick = () => {} }: Props) => {
  const isPrimary = variant.name === "primary";
  const isWatch = isPrimary && variant.type === "watch";
  const isSave = isPrimary && variant.type === "save";

  let buttonStyles = "h-12 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-md select-none ";

  if (isWatch) {
    buttonStyles += "bg-white text-slate-950 hover:bg-slate-200 active:scale-95 shadow-lg shadow-white/5 ";
  } else if (isSave) {
    buttonStyles += "bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 text-slate-100 hover:bg-slate-800 active:scale-95 backdrop-blur-md ";
  } else if (variant.name === "secondary") {
    buttonStyles += "bg-blue-600 hover:bg-blue-500 text-white active:scale-95 shadow-blue-900/30 ";
  } else {
    buttonStyles += "bg-slate-800 text-slate-100 hover:bg-slate-700 ";
  }

  if (isFull) {
    buttonStyles += "w-full ";
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      aria-label={variant.name}
      onClick={onClick}
      className={buttonStyles}
    >
      {isWatch && <PlayIcon className="h-5 w-5 fill-slate-950 shrink-0" />}
      {isSave && <PlusIcon className="h-5 w-5 text-slate-200 shrink-0" />}
      {children ? <span>{children}</span> : isSave ? <span>Watchlist</span> : null}
    </motion.button>
  );
};

export default Button;
