import { descriptionType } from "@/config/data/files.schema";


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
        You can find me on linkedin , instagram , reach me via email or you can chat with my agent to know more.
      </div>
      
      
    </section>
  );
}
