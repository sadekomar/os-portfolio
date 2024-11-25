import { allProjects, ProjectKeys } from "@/app/work/[project]/projects";

import Image from "next/image";

export default async function Project({ params }: { params: Promise<{ project: string }> }) {
  const availableProjects = ["loom-cairo", "little-lads", "activity-management-platform"];

  const { project: key } = await params;
  console.log(key);

  if (!availableProjects.includes(key))
    return (
      <div className="mx-4 mt-10 md:mx-20">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Project not found</h1>
      </div>
    );

  const project = allProjects[key as ProjectKeys];

  return (
    <>
      <Image src={project.image} alt={project.imageAlt} placeholder="blur" priority />

      <div className="mx-4 mt-10 md:mx-20">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">{project.title}</h1>
        <a
          className="font-medium tracking-[-0.04em] text-[#525252] hover:underline"
          href={`https://${project.link}`}
          target="_blank"
        >
          {project.link}
        </a>
        <p className="mb-10 max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
          {project.description}
        </p>

        <h2 className="mb-2 text-2xl font-bold tracking-tight">Technologies Used</h2>
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {project.technologies.backend.length == 0 ? null : (
            <div>
              <h3 className="mb-1 font-medium">Backend</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.backend.map((tech) => (
                  <div
                    key={tech}
                    className="flex h-10 items-center rounded-xl bg-[#E4E4E4] px-3 font-medium"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          )}
          {project.technologies.frontend.length == 0 ? null : (
            <div>
              <h3 className="mb-1 font-medium">Frontend</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.frontend.map((tech) => (
                  <div
                    key={tech}
                    className="flex h-10 items-center rounded-xl bg-[#E4E4E4] px-3 font-medium"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {project.paragraphs.map((paragraph, index) => (
        <div key={index} className="mb-8">
          <div className="mx-4 mb-4 grid md:mx-20 md:grid-cols-[1fr_2fr]">
            <h3 className="mb-2 h-fit text-2xl font-semibold tracking-tight md:sticky md:top-2 md:max-w-60">
              {paragraph.title}
            </h3>
            <div className="max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
              {paragraph.content.map((content) => (
                <p className="mb-4" key={content}>
                  {content}
                </p>
              ))}
            </div>
          </div>
          {paragraph.image && (
            <Image src={paragraph.image} alt={paragraph.title} className="mb-10" />
          )}
        </div>
      ))}
    </>
  );
}
