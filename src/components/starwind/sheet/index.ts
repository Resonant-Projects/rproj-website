import * as SheetComponent from '~/components/starwind/sheet/Sheet.astro';
import * as SheetCloseComponent from '~/components/starwind/sheet/SheetClose.astro';
import * as SheetContentComponent from '~/components/starwind/sheet/SheetContent.astro';
import * as SheetDescriptionComponent from '~/components/starwind/sheet/SheetDescription.astro';
import * as SheetFooterComponent from '~/components/starwind/sheet/SheetFooter.astro';
import * as SheetHeaderComponent from '~/components/starwind/sheet/SheetHeader.astro';
import * as SheetTitleComponent from '~/components/starwind/sheet/SheetTitle.astro';
import * as SheetTriggerComponent from '~/components/starwind/sheet/SheetTrigger.astro';

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
