import * as SheetComponent from './Sheet.astro';
import * as SheetCloseComponent from './SheetClose.astro';
import * as SheetContentComponent from './SheetContent.astro';
import * as SheetDescriptionComponent from './SheetDescription.astro';
import * as SheetFooterComponent from './SheetFooter.astro';
import * as SheetHeaderComponent from './SheetHeader.astro';
import * as SheetTitleComponent from './SheetTitle.astro';
import * as SheetTriggerComponent from './SheetTrigger.astro';

const Sheet = SheetComponent.default;
const SheetClose = SheetCloseComponent.default;
const SheetContent = SheetContentComponent.default;
const SheetDescription = SheetDescriptionComponent.default;
const SheetFooter = SheetFooterComponent.default;
const SheetHeader = SheetHeaderComponent.default;
const SheetTitle = SheetTitleComponent.default;
const SheetTrigger = SheetTriggerComponent.default;
const sheetContentModule = SheetContentComponent as Record<string, unknown>;
const sheetDescriptionModule = SheetDescriptionComponent as Record<string, unknown>;
const sheetFooterModule = SheetFooterComponent as Record<string, unknown>;
const sheetHeaderModule = SheetHeaderComponent as Record<string, unknown>;
const sheetTitleModule = SheetTitleComponent as Record<string, unknown>;

const SheetVariants = {
  sheetCloseButton: sheetContentModule.sheetCloseButton,
  sheetDescription: sheetDescriptionModule.sheetDescription,
  sheetFooter: sheetFooterModule.sheetFooter,
  sheetHeader: sheetHeaderModule.sheetHeader,
  sheetTitle: sheetTitleModule.sheetTitle,
  dialogBackdrop: sheetContentModule.dialogBackdrop,
  sheetContent: sheetContentModule.sheetContent,
} as const;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetVariants,
};

export default {
  Root: Sheet,
  Trigger: SheetTrigger,
  Content: SheetContent,
  Header: SheetHeader,
  Footer: SheetFooter,
  Title: SheetTitle,
  Description: SheetDescription,
  Close: SheetClose,
};
