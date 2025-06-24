import { getOrganization } from '@/actions/organization.js'
import OrgSwitcher from '@/components/Org-switcher'
import React from 'react'
import ProjectList from './components/ProjectList';

export default async function Organisation({ params }) {

  const { organisationId } = await params
  
  if (!organisationId) return (<div>Organization not found</div>);

  const organisation = await getOrganization(organisationId)
  if (!organisation) {
    return (
      <div> Organization not found</div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start">
        <h1 className="text-5xl font-bold gradient-title pb-2">
          {organisation.name}&rsquo;s Projects
        </h1>
        <OrgSwitcher /> 
      </div>
      <div className="mb-4">
        <ProjectList orgId={organisation.id} />
      </div>
    </div>
  )
}
