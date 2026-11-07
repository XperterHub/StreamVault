"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Session = ({ children }: Props) => {
  return (
    <SessionProvider session={null} refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
};

export default Session;
