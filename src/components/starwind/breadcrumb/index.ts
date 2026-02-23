import * as BreadcrumbComponent from '~/components/starwind/breadcrumb/Breadcrumb.astro';
import * as BreadcrumbEllipsisComponent from '~/components/starwind/breadcrumb/BreadcrumbEllipsis.astro';
import * as BreadcrumbItemComponent from '~/components/starwind/breadcrumb/BreadcrumbItem.astro';
import * as BreadcrumbLinkComponent from '~/components/starwind/breadcrumb/BreadcrumbLink.astro';
import * as BreadcrumbListComponent from '~/components/starwind/breadcrumb/BreadcrumbList.astro';
import * as BreadcrumbPageComponent from '~/components/starwind/breadcrumb/BreadcrumbPage.astro';
import * as BreadcrumbSeparatorComponent from '~/components/starwind/breadcrumb/BreadcrumbSeparator.astro';

const Breadcrumb = BreadcrumbComponent.default;
const BreadcrumbEllipsis = BreadcrumbEllipsisComponent.default;
const BreadcrumbItem = BreadcrumbItemComponent.default;
const BreadcrumbLink = BreadcrumbLinkComponent.default;
const BreadcrumbList = BreadcrumbListComponent.default;
const BreadcrumbPage = BreadcrumbPageComponent.default;
const BreadcrumbSeparator = BreadcrumbSeparatorComponent.default;
const breadcrumbEllipsisModule = BreadcrumbEllipsisComponent as Record<string, unknown>;
const breadcrumbItemModule = BreadcrumbItemComponent as Record<string, unknown>;
const breadcrumbLinkModule = BreadcrumbLinkComponent as Record<string, unknown>;
const breadcrumbListModule = BreadcrumbListComponent as Record<string, unknown>;
const breadcrumbPageModule = BreadcrumbPageComponent as Record<string, unknown>;
const breadcrumbSeparatorModule = BreadcrumbSeparatorComponent as Record<string, unknown>;

const BreadcrumbVariants = {
  breadcrumbEllipsis: breadcrumbEllipsisModule.breadcrumbEllipsis,
  breadcrumbItem: breadcrumbItemModule.breadcrumbItem,
  breadcrumbLink: breadcrumbLinkModule.breadcrumbLink,
  breadcrumbList: breadcrumbListModule.breadcrumbList,
  breadcrumbPage: breadcrumbPageModule.breadcrumbPage,
  breadcrumbSeparator: breadcrumbSeparatorModule.breadcrumbSeparator,
} as const;

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbVariants,
};

export default {
  Root: Breadcrumb,
  List: BreadcrumbList,
  Ellipsis: BreadcrumbEllipsis,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Separator: BreadcrumbSeparator,
  Page: BreadcrumbPage,
};
