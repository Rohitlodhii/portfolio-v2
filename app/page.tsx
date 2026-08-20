import ProfilePage from "@/components/base/profile";
import Descriptionpage from "@/components/base/description";
import { getDescription, getProjects } from "@/config/data/files";
import ProjectsPage from "@/components/base/Projects";
import OtherProject from "@/components/base/OtherProject";
import Hackathon from "@/components/base/hackathon";
import { Blogarea } from "@/components/ui/Blogarea";
import { listBlogPosts } from "@/lib/blogs";
import HackathonDescription from "@/components/base/hackathonDescription";
import BlogDescription from "@/components/base/BlogDescription";

// These values come from JSON files that can change while the server is running.
export const dynamic = "force-dynamic";

export default async function Home() {

  const descriptionData = await getDescription();
  const projectsData = await getProjects();
  const posts = await listBlogPosts();

  return (
    <div className="mx-auto flex flex-col gap-6 h-screen w-full max-w-xl  px-4">
      <ProfilePage />
      <Descriptionpage data={descriptionData}/>
      <ProjectsPage data={projectsData}/>
      <OtherProject/>
      <HackathonDescription/>
      <Hackathon/>
      <BlogDescription/>
      <Blogarea posts={posts}/>

    </div>
  );
}
