import * as DialogComponent from '~/components/starwind/dialog/Dialog.astro';
import * as DialogCloseComponent from '~/components/starwind/dialog/DialogClose.astro';
import * as DialogContentComponent from '~/components/starwind/dialog/DialogContent.astro';
import * as DialogDescriptionComponent from '~/components/starwind/dialog/DialogDescription.astro';
import * as DialogFooterComponent from '~/components/starwind/dialog/DialogFooter.astro';
import * as DialogHeaderComponent from '~/components/starwind/dialog/DialogHeader.astro';
import * as DialogTitleComponent from '~/components/starwind/dialog/DialogTitle.astro';
import * as DialogTriggerComponent from '~/components/starwind/dialog/DialogTrigger.astro';

const Dialog = DialogComponent.default;
const DialogClose = DialogCloseComponent.default;
const DialogContent = DialogContentComponent.default;
const DialogDescription = DialogDescriptionComponent.default;
const DialogFooter = DialogFooterComponent.default;
const DialogHeader = DialogHeaderComponent.default;
const DialogTitle = DialogTitleComponent.default;
const DialogTrigger = DialogTriggerComponent.default;
const dialogContentModule = DialogContentComponent as Record<string, unknown>;
const dialogDescriptionModule = DialogDescriptionComponent as Record<string, unknown>;
const dialogFooterModule = DialogFooterComponent as Record<string, unknown>;
const dialogHeaderModule = DialogHeaderComponent as Record<string, unknown>;
const dialogTitleModule = DialogTitleComponent as Record<string, unknown>;

const DialogVariants = {
  dialogBackdrop: dialogContentModule.dialogBackdrop,
  dialogContent: dialogContentModule.dialogContent,
  dialogCloseButton: dialogContentModule.dialogCloseButton,
  dialogDescription: dialogDescriptionModule.dialogDescription,
  dialogFooter: dialogFooterModule.dialogFooter,
  dialogHeader: dialogHeaderModule.dialogHeader,
  dialogTitle: dialogTitleModule.dialogTitle,
} as const;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogVariants,
};

export default {
  Root: Dialog,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
};
