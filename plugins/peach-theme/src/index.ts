export * from './types';
export {PeachHero} from './components/PeachHero';
export {PeachCard} from './components/PeachCard';
export {PeachButton} from './components/PeachButton';
export {PeachLayout} from './layout/PeachLayout';
export {PeachPreview} from './preview/PeachPreview';

import {ComponentDefinition, PluginDefinition, ThemeDefinition} from './types';
import {PeachHero} from './components/PeachHero';
import {PeachCard} from './components/PeachCard';
import {PeachButton} from './components/PeachButton';
import {PeachLayout} from './layout/PeachLayout';
import {PeachPreview} from './preview/PeachPreview';

const components: ComponentDefinition[] = [
  {
    name: 'PeachHero',
    component: PeachHero,
    description: 'A warm peachy gradient hero section',
    icon: 'hero',
    defaultProps: {
      title: 'Welcome to Peach',
      subtitle: 'A warm, inviting theme for your site',
      bgGradient: 'linear-gradient(135deg, #FF8C42 0%, #FF6B6B 100%)',
      textColor: '#FFFFFF',
    },
    schema: [
      {name: 'title', label: 'Title', type: 'text'},
      {name: 'subtitle', label: 'Subtitle', type: 'text'},
      {name: 'bgGradient', label: 'Background Gradient', type: 'text'},
      {name: 'textColor', label: 'Text Color', type: 'color'},
    ],
  },
  {
    name: 'PeachCard',
    component: PeachCard,
    description: 'A warm card with peach accent border',
    icon: 'card',
    canHaveChildren: true,
    defaultProps: {
      title: 'Card Title',
      content: '<p>Card content with a peachy twist.</p>',
      padding: 'md',
      shadow: true,
      border: true,
      accentColor: '#FF8C42',
    },
    schema: [
      {name: 'title', label: 'Title', type: 'text'},
      {name: 'content', label: 'Body Content', type: 'textarea'},
      {
        name: 'padding',
        label: 'Padding',
        type: 'select',
        options: [
          {label: 'None', value: 'none'},
          {label: 'Small', value: 'sm'},
          {label: 'Medium', value: 'md'},
          {label: 'Large', value: 'lg'},
        ],
      },
      {name: 'backgroundColor', label: 'Background Color', type: 'color'},
      {name: 'textColor', label: 'Text Color', type: 'color'},
      {name: 'shadow', label: 'Show Shadow', type: 'checkbox'},
      {name: 'border', label: 'Show Border', type: 'checkbox'},
      {name: 'accentColor', label: 'Accent Color', type: 'color'},
    ],
  },
  {
    name: 'PeachButton',
    component: PeachButton,
    description: 'A peach-styled call to action button',
    icon: 'button',
    defaultProps: {
      label: 'Get Started',
      link: '#',
      variant: 'primary',
      size: 'md',
    },
    schema: [
      {name: 'label', label: 'Button Text', type: 'text'},
      {name: 'link', label: 'Link URL', type: 'text'},
      {
        name: 'variant',
        label: 'Style',
        type: 'select',
        options: [
          {label: 'Primary', value: 'primary'},
          {label: 'Secondary', value: 'secondary'},
          {label: 'Outline', value: 'outline'},
        ],
      },
      {
        name: 'size',
        label: 'Size',
        type: 'select',
        options: [
          {label: 'Small', value: 'sm'},
          {label: 'Medium', value: 'md'},
          {label: 'Large', value: 'lg'},
        ],
      },
    ],
  },
];

const peachTheme: ThemeDefinition = {
  label: 'Peach',
  description:
    'A warm, inviting theme with peachy gradients, soft cream backgrounds, and amber accents. Perfect for welcoming, community-oriented sites.',
  previewComponent: PeachPreview,
  cssVariables: {
    '--color-l1-bg': '#FFF8F0',
    '--color-l2-surface': '#FFFFFF',
    '--color-l3-hover': '#FFF0E0',
    '--color-l4-active': '#FFE0C8',
    '--color-l5-border': '#E8D8C8',
    '--color-l6-elevated': '#FFFFFF',
    '--color-primary': '#FF8C42',
    '--color-primary-dark': '#E67320',
    '--color-primary-light': '#FFF0E0',
    '--color-teal': '#4A9A8A',
    '--color-teal-light': '#E8F2F4',
    '--color-warm': '#D4956A',
    '--color-warm-light': '#F8EDE6',
    '--color-success': '#6AAA7A',
    '--color-success-light': '#EAF2EC',
    '--color-warning': '#C9A84A',
    '--color-warning-light': '#F8F2E6',
    '--color-danger': '#D45A5A',
    '--color-danger-light': '#F5ECEC',
    '--color-text': '#2D1B00',
    '--color-text-secondary': '#6B5A4A',
    '--color-text-muted': '#9A8A80',
  },
  darkCssVariables: {
    '--color-l1-bg': '#1A1208',
    '--color-l2-surface': '#22190E',
    '--color-l2-sidebar': '#14100A',
    '--color-dark-bg': '#1A1208',
    '--color-dark-surface': '#22190E',
    '--color-dark-card': '#2A1E14',
    '--color-dark-border': '#3A2E24',
    '--color-dark-hover': '#322820',
    '--color-dark-text': '#FFF0E0',
    '--color-dark-text-secondary': '#B0A090',
    '--color-dark-sidebar': '#0E0A06',
    '--color-primary': '#FFa058',
    '--color-primary-dark': '#FF8C42',
    '--color-primary-light': '#3A2518',
    '--color-l5-border': '#3A2E24',
    '--color-text': '#FFF0E0',
    '--color-text-secondary': '#B0A090',
    '--color-text-muted': '#7A6A5A',
  },
  layout: PeachLayout,
  fontFamily: 'Nunito',
  defaultPages: [
    {
      title: 'Home',
      slug: 'home',
      path: '/home',
      showInNavigation: true,
      components: [
        {
          pluginName: '@gustav/peach-theme',
          componentName: 'PeachHero',
          props: {
            title: 'Welcome to Peach',
            subtitle: 'A warm and friendly place to call home',
            bgGradient: 'linear-gradient(135deg, #FF8C42 0%, #FF6B6B 100%)',
            textColor: '#FFFFFF',
          },
          displayOrder: 0,
        },
        {
          pluginName: '@gustav/core-plugin',
          componentName: 'Divider',
          props: {},
          displayOrder: 1,
        },
        {
          pluginName: '@gustav/peach-theme',
          componentName: 'PeachCard',
          props: {
            title: 'About Us',
            content:
              '<p>We are a community-driven platform built with warmth and care. Explore what we have to offer.</p>',
            padding: 'md',
            shadow: true,
            border: true,
            accentColor: '#FF8C42',
          },
          displayOrder: 2,
        },
      ],
    },
    {
      title: 'About',
      slug: 'about',
      path: '/about',
      showInNavigation: true,
      components: [
        {
          pluginName: '@gustav/peach-theme',
          componentName: 'PeachHero',
          props: {
            title: 'About',
            subtitle: 'Learn more about us',
            bgGradient: 'linear-gradient(135deg, #4A9A8A 0%, #FF8C42 100%)',
            textColor: '#FFFFFF',
          },
          displayOrder: 0,
        },
        {
          pluginName: '@gustav/core-plugin',
          componentName: 'RichText',
          props: {
            content:
              '<p>This is the About page. Edit this content to tell your visitors about your site.</p>',
          },
          displayOrder: 1,
        },
      ],
    },
    {
      title: 'Contact',
      slug: 'contact',
      path: '/contact',
      showInNavigation: true,
      components: [
        {
          pluginName: '@gustav/peach-theme',
          componentName: 'PeachHero',
          props: {
            title: 'Get In Touch',
            subtitle: 'We would love to hear from you',
            bgGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 100%)',
            textColor: '#FFFFFF',
          },
          displayOrder: 0,
        },
        {
          pluginName: '@gustav/peach-theme',
          componentName: 'PeachCard',
          props: {
            title: 'Contact Us',
            content:
              '<p>Reach out via email or social media. We are always happy to chat.</p>',
            padding: 'lg',
            shadow: true,
            border: true,
            accentColor: '#4A9A8A',
          },
          displayOrder: 1,
        },
      ],
    },
  ],
  defaultPluginSettings: {
    '@gustav/core-plugin': {
      siteName: 'Peach',
      primaryBrandColor: '#FF8C42',
    },
  },
};

export const plugin: PluginDefinition = {
  name: '@gustav/peach-theme',
  components,
  settingsSchema: [
    {
      name: 'accentColor',
      label: 'Accent Color Override',
      type: 'color',
    },
  ],
  theme: peachTheme,
};