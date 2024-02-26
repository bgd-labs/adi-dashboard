import twitterIcon from "@/assets/icons/twitter.svg";
import websiteIcon from "@/assets/icons/website.svg";
import githubIcon from "@/assets/icons/github.svg";
import Image from "next/image";
import app from '../../package.json';

export const Footer = () => {
  return (
    <div className="flex items-center justify-center text-sm text-brand-500 mt-10">
      <div>
        <div className="mb-2 text-center">by BGD Labs</div>
        <div className="flex justify-center gap-1">
          <a
            href="https://twitter.com/bgdlabs"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src={twitterIcon}
              className="h-6 w-6"
              alt="BGD Labs Official X Account"
            />
          </a>
          <a href="https://github.com/bgd-labs" target="_blank" rel="noreferrer">
            <Image
              src={githubIcon}
              className="h-6 w-6"
              alt="BGD Labs GitHub"
            />
          </a>
          <a href="https://bgdlabs.com/" target="_blank" rel="noreferrer">
            <Image
              src={websiteIcon}
              className="h-6 w-6"
              alt="BGD Labs Website"
            />
          </a>
        </div>
        <div className="text-center font-mono mt-4 text-brand-500 opacity-60">
          {app.version}
        </div>
      </div>
    </div>
  );
};
