import * as PaginationComponent from './Pagination.astro';
import * as PaginationContentComponent from './PaginationContent.astro';
import * as PaginationEllipsisComponent from './PaginationEllipsis.astro';
import * as PaginationItemComponent from './PaginationItem.astro';
import * as PaginationLinkComponent from './PaginationLink.astro';
import * as PaginationNextComponent from './PaginationNext.astro';
import * as PaginationPreviousComponent from './PaginationPrevious.astro';

const Pagination = PaginationComponent.default;
const PaginationContent = PaginationContentComponent.default;
const PaginationEllipsis = PaginationEllipsisComponent.default;
const PaginationItem = PaginationItemComponent.default;
const PaginationLink = PaginationLinkComponent.default;
const PaginationNext = PaginationNextComponent.default;
const PaginationPrevious = PaginationPreviousComponent.default;
const paginationModule = PaginationComponent as Record<string, unknown>;
const paginationContentModule = PaginationContentComponent as Record<string, unknown>;
const paginationEllipsisModule = PaginationEllipsisComponent as Record<string, unknown>;
const paginationItemModule = PaginationItemComponent as Record<string, unknown>;
const paginationLinkModule = PaginationLinkComponent as Record<string, unknown>;
const paginationNextModule = PaginationNextComponent as Record<string, unknown>;
const paginationPreviousModule = PaginationPreviousComponent as Record<string, unknown>;

const PaginationVariants = {
  pagination: paginationModule.pagination,
  paginationContent: paginationContentModule.paginationContent,
  paginationEllipsis: paginationEllipsisModule.paginationEllipsis,
  paginationItem: paginationItemModule.paginationItem,
  paginationLink: paginationLinkModule.paginationLink,
  paginationNext: paginationNextModule.paginationNext,
  paginationPrevious: paginationPreviousModule.paginationPrevious,
} as const;

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationVariants,
};

export default {
  Root: Pagination,
  Content: PaginationContent,
  Ellipsis: PaginationEllipsis,
  Item: PaginationItem,
  Link: PaginationLink,
  Next: PaginationNext,
  Previous: PaginationPrevious,
};
