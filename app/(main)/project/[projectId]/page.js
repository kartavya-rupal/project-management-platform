import { getProject } from '@/actions/project'
import { notFound } from 'next/navigation'
import React from 'react'
import SprintCreationForm from '../_components/CreateSprint'
import SprintBoard from '../_components/SprintBoard'

const ProjectPage = async ({ params }) => {

  const { projectId } = await params

  const project = await getProject(projectId)

  if (!project) notFound()

  return (
    <div className="container mx-auto">
      <SprintCreationForm
        projectTitle={project.name}
        projectId={projectId}
        projectKey={project.key}
        sprints={project.sprints}
      />


      {project.sprints.length > 0 ? (
        <SprintBoard
          sprints={project.sprints}
          projectId={projectId}
          orgId={project.organizationId}
        />
      ) : (
        <div>Create a Sprint from button above</div>
      )}
    </div>
  )
}

export default ProjectPage
