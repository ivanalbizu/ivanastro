import { deSlugify } from '@utils/deSlugify';

interface GenerateBreadcrumbsProps {
  currentPath: string,
}

export const generateBreadcrumbs: any = ({ currentPath }: GenerateBreadcrumbsProps) => {
  const pathSegments = currentPath.split('/').filter(segment => segment.trim() !== '');
  const breadcrumbs = pathSegments.map((_, index) => {
    const link = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = deSlugify(pathSegments.at(index) ?? '');

    return { label, link };
  });

  currentPath !== '/' && breadcrumbs.unshift({ label: "Inicio", link: "/" });

  return breadcrumbs;
}
