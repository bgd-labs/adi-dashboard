import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import { type ReactNode } from "react";
import * as React from "react";

interface LinkProps extends NextLinkProps {
  href: string;
  inNewWindow?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  className?: React.ComponentProps<"a">["className"];
}

export const Link = ({
  href,
  inNewWindow,
  children,
  disabled,
  ...props
}: LinkProps) => {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  return (
    <>
      {disabled ? (
        <p className={props.className}>{children}</p>
      ) : (
        <>
          {!isExternal ? (
            <NextLink href={href} passHref {...props}>
              <p>{children}</p>
            </NextLink>
          ) : (
            <a
              href={href}
              rel="noreferrer"
              target={inNewWindow ? "_blank" : undefined}
              {...props}
            >
              {children}
            </a>
          )}
        </>
      )}
    </>
  );
};
