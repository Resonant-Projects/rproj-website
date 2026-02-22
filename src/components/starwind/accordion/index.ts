import * as AccordionComponent from '~/components/starwind/accordion/Accordion.astro';
import * as AccordionContentComponent from '~/components/starwind/accordion/AccordionContent.astro';
import * as AccordionItemComponent from '~/components/starwind/accordion/AccordionItem.astro';
import * as AccordionTriggerComponent from '~/components/starwind/accordion/AccordionTrigger.astro';

const Accordion = AccordionComponent.default;
const AccordionContent = AccordionContentComponent.default;
const AccordionItem = AccordionItemComponent.default;
const AccordionTrigger = AccordionTriggerComponent.default;
const accordionModule = AccordionComponent as Record<string, unknown>;
const accordionContentModule = AccordionContentComponent as Record<string, unknown>;
const accordionItemModule = AccordionItemComponent as Record<string, unknown>;
const accordionTriggerModule = AccordionTriggerComponent as Record<string, unknown>;

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
