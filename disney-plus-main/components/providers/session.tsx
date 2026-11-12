"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Session = ({ children }: Props) => {
  return <>{children}</>;
};

export default Session;
