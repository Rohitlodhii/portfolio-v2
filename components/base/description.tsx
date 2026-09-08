import { descriptionType } from "@/config/data/files.schema";
import { IconArrowUpRight, IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";
import { ShareProfileButton } from "@/components/ui/share-tray";


type DescriptionPageProps = {
  data: descriptionType;
};

export default function Descriptionpage({ data }: DescriptionPageProps) {
  return (
    <section className="flex flex-col gap-4 font-medium text-[14px]">
      <div>
        I am a {data.role} based in {data.location}
      </div>
      <div>
        I am currently in final year of my four year Btech degree at UIT rgpv, I can make highly performant backends, clean and responsive frontends, and deploy scalable applications from development to production.
      </div>
      <div>
        I built morrit , a compile time react inspector, fastdroid which is performant android emulator studio and tons of different useful apps.
      </div>
      <div>
        You can find me on <Link className=" bg-neutral-600 text-white cursor-pointer px-2 rounded-sm" href="www.linkedin.com/in/rohitlodhiii">Linkedin</Link> , <Link className="  bg-neutral-600 text-white px-2 cursor-pointer rounded-sm" href="https://www.instagram.com/rohitlodhiii">instagram</Link> , reach me via <Link className="  bg-neutral-600  text-white px-1 cursor-pointer rounded-sm" href="mailto:rohitlodhi0225@gmail.com">email</Link> or you can find me at most of the places with username @rohitlodhii.
      </div>
      <div className="flex gap-2 ">
        <Link className="flex bg-secondary px-2 py-1 rounded-xl gap-1 items-center" href="https://github.com/rohitlodhii"> <IconBrandGithub className="size-4"/> <span>Github</span> </Link>
        <ShareProfileButton />
      </div>


    </section>
  );
}
