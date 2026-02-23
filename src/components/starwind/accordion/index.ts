import * as AccordionComponent from '~/components/starwind/accordion/Accordion.astro';
import * as AccordionContentComponent from '~/components/starwind/accordion/AccordionContent.astro';
import * as AccordionItemComponent from '~/components/starwind/accordion/AccordionItem.astro';
import * as AccordionTriggerComponent from '~/components/starwind/accordion/AccordionTrigger.astro';

const Accordion = AccordionComponent.default;
const AccordionContent = AccordionContentComponent.default;
const AccordionItem = AccordionItemComponent.default;
const AccordionTrigger = AccordionTriggerComponent.default;

type VariantFunction = (...args: unknown[]) => string;
type VariantModule = Record<string, VariantFunction> & { default: unknown };

const accordionModule = AccordionComponent as unknown as VariantModule;
const accordionContentModule = AccordionContentComponent as unknown as VariantModule;
const accordionItemModule = AccordionItemComponent as unknown as VariantModule;
const accordionTriggerModule = AccordionTriggerComponent as unknown as VariantModule;

const AccordionVariants = {
  accordion: accordionModule.accordion,
  accordionContent: accordionContentModule.accordionContent,
  accordionItem: accordionItemModule.accordionItem,
  accordionTrigger: accordionTriggerModule.accordionTrigger,
} as const;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, AccordionVariants };

export default {
  Root: Accordion,
  Content: AccordionContent,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
};
