import { PageHeader } from '../components/PageHeader';
import { ResourceManager } from '../ResourceManager';
import { RESOURCES, type ResourceKey } from '../resources';

export default function ResourcePage({ resource }: { resource: ResourceKey }) {
  const config = RESOURCES[resource];
  return (
    <>
      <PageHeader title={config.title} description={config.description} />
      <ResourceManager config={config} />
    </>
  );
}
