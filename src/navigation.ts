import {
  getAsset,
  getBlogCategoryPermalink,
  getBlogPermalink,
  getBlogTagPermalink,
  getPermalink,
} from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
    },
    {
      text: 'Services',
      links: [
        {
          text: 'Design',
          href: getPermalink('/services/design'),
        },
        {
          text: 'Rhythm',
          href: getPermalink('/services/rhythm'),
        },
        {
          text: 'Color',
          href: getPermalink('/services/color'),
        },
        {
          text: 'Motion',
          href: getPermalink('/services/motion'),
        },
      ],
    },
    // {
    //   text: 'Landing',
    //   links: [
    //     {
    //       text: 'Lead Generation',
    //       href: getPermalink('/landing/lead-generation'),
    //     },
    //     {
    //       text: 'Long-form Sales',
    //       href: getPermalink('/landing/sales'),
    //     },
    //     {
    //       text: 'Click-Through',
    //       href: getPermalink('/landing/click-through'),
    //     },
    //     {
    //       text: 'Product Details (or Services)',
    //       href: getPermalink('/landing/product'),
    //     },
    //     {
    //       text: 'Coming Soon or Pre-Launch',
    //       href: getPermalink('/landing/pre-launch'),
    //     },
    //     {
    //       text: 'Subscription',
    //       href: getPermalink('/landing/subscription'),
    //     },
    //   ],
    // },
    {
      text: 'Blog',
      links: [
        {
          text: 'All Articles',
          href: getBlogPermalink(),
        },
        {
          text: 'Browse By Category',
          href: getBlogCategoryPermalink(),
        },
        {
          text: 'Browse By Tag',
          href: getBlogTagPermalink(),
        },
      ],
    },
    {
      text: 'Resources',
      href: getPermalink('/resources/all/1'),
    },
    {
      text: 'TIL',
      href: getPermalink('/til/all/1'),
    },
    {
      text: 'About',
      href: getPermalink('/about'),
    },
  ],
  actions: [{ text: 'Start Project', href: getPermalink('/contact#form'), icon: 'tabler:input-spark' }],
};

export const footerData = {
  links: [
    {
      title: 'Services',
      links: [
        { text: 'Design', href: getPermalink('/services/design') },
        { text: 'Rhythm', href: getPermalink('/services/rhythm') },
        { text: 'Color', href: getPermalink('/services/color') },
        { text: 'Motion', href: getPermalink('/services/motion') },
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'Pricing', href: getPermalink('/pricing') },
      ],
    },
    {
      title: 'Content',
      links: [
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Resources', href: getPermalink('/resources/all/1') },
        { text: 'TIL', href: getPermalink('/til/all/1') },
        { text: 'Categories', href: getBlogCategoryPermalink() },
        { text: 'Tags', href: getBlogTagPermalink() },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Start Project', href: getPermalink('/contact#form') },
        { text: 'Link Page', href: getPermalink('/link') },
        { text: 'Home', href: getPermalink('/') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { text: 'Terms', href: getPermalink('/terms') },
        { text: 'Privacy Policy', href: getPermalink('/privacy') },
        { text: 'RSS Feed', href: getAsset('/rss.xml') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    // { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    {
      ariaLabel: 'Instagram',
      icon: 'tabler:brand-instagram',
      href: 'https://www.instagram.com/resonantrhythm',
    },
    {
      ariaLabel: 'Facebook',
      icon: 'tabler:brand-facebook',
      href: 'https://www.facebook.com/resonantrhythm',
    },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/keithce' },
  ],
  footNote: `
     · All rights reserved.
  `,
};
