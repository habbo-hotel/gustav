import {ComponentDefinition, PluginDefinition} from './types';
import {Heading} from './components/Heading';
import {RichText} from './components/RichText';
import {Button} from './components/Button';
import {Image} from './components/Image';
import {Hero} from './components/Hero';
import {Divider} from './components/Divider';

export * from './types';
export * from './components/RichText';
export * from './components/Hero';
export * from './components/Divider';
export * from './components/Heading';
export * from './components/Button';
export * from './components/Image';

const components: ComponentDefinition[] = [
  {
    name: 'Heading',
    component: Heading,
    description: 'A structural heading text',
    defaultProps: {
      text: 'Page Section',
      level: 2,
      align: 'left',
    },
    schema: [
      {name: 'text', label: 'Heading Text', type: 'text'},
      {
        name: 'level',
        label: 'Level',
        type: 'select',
        options: [
          {label: 'H1', value: 1},
          {label: 'H2', value: 2},
          {label: 'H3', value: 3},
          {label: 'H4', value: 4},
          {label: 'H5', value: 5},
          {label: 'H6', value: 6},
        ],
      },
      {
        name: 'align',
        label: 'Alignment',
        type: 'select',
        options: [
          {label: 'Left', value: 'left'},
          {label: 'Center', value: 'center'},
          {label: 'Right', value: 'right'},
        ],
      },
    ],
  },
  {
    name: 'RichText',
    component: RichText,
    description: 'A simple rich text block',
    defaultProps: {
      content: '<p>Hello world</p>',
    },
    schema: [
      {
        name: 'content',
        label: 'Content',
        type: 'textarea',
      },
    ],
  },
  {
    name: 'Button',
    component: Button,
    description: 'A clickable call to action',
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
  {
    name: 'Image',
    component: Image,
    description: 'A visual media block',
    defaultProps: {
      src: '',
      alt: 'Image description',
      caption: '',
      rounded: true,
    },
    schema: [
      {name: 'src', label: 'Image URL', type: 'text'},
      {name: 'alt', label: 'Alt Text', type: 'text'},
      {name: 'caption', label: 'Caption', type: 'text'},
      {name: 'rounded', label: 'Rounded Corners', type: 'checkbox'},
    ],
  },
  {
    name: 'Hero',
    component: Hero,
    description: 'A big hero section',
    defaultProps: {
      title: 'Welcome to Gustav',
      subtitle: 'The pro CMS',
      bgColor: '#f1f5f9',
      textColor: '#0f172a',
    },
    schema: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
      },
      {
        name: 'bgColor',
        label: 'Background Color',
        type: 'color',
      },
      {
        name: 'textColor',
        label: 'Text Color',
        type: 'color',
      },
    ],
  },
  {
    name: 'Divider',
    component: Divider,
    description: 'A horizontal line',
    defaultProps: {},
    schema: [],
  },
];

export const corePlugin: PluginDefinition = {
  name: '@gustav/core-plugin',
  components,
  settingsSchema: [
    {
      name: 'siteName',
      label: 'Default Site Name',
      type: 'text',
    },
    {
      name: 'primaryBrandColor',
      label: 'Brand Primary Color',
      type: 'color',
    },
  ],
};
