import Image from "next/image";
import { Box } from "@/components/Box";
import { Button } from "@/components/Button";
import Link from "next/link";
import logo from "@/assets/logo.svg";
import { env } from "@/env";

export const Header = () => {
  return (
    <Box className="border-brand-900 bg-brand-900 py-6 pl-4 pr-6">
      <div className="align-center flex justify-between text-white">
        <Link href="/">
          <div className="group flex items-start gap-2.5">
            <Image
              src={logo}
              alt="a.DI"
              className="h-[66px] w-[66px] transition-transform"
              priority
            />

            <div className="relative">
              <div className="mb-0.5 gap-2 text-2xl font-bold">a.DI</div>
              <div className="text-[9px] font-semibold uppercase tracking-wider opacity-60 group-hover:opacity-100">
                aave delivery
                <br />
                infrastructure
              </div>
              {env.ENVIRONMENT_STAGE === "PREPROD" && (
                <div className="inline-block bg-white px-1 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-wider text-brand-900">
                  Preprod
                </div>
              )}
            </div>
          </div>
        </Link>
        <Link href="/status">
          <div className="group absolute right-5 top-6 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider hover:text-green-400">
            <span className="hidden opacity-50 group-hover:opacity-100 sm:block">
              status
            </span>
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
          </div>
        </Link>
        <div className="flex items-end">
          <Button className="px-3 py-1 text-sm">Connect wallet</Button>
        </div>
      </div>
    </Box>
  );
};
