import {Hero} from './components/Hero';
import {Grid} from './components/Grid';
import {Card} from './components/Card';
import {Image} from './components/Image';
import {Button} from './components/Button';
import {Heading} from './components/Heading';
import {Divider} from './components/Divider';
import {RichText} from './components/RichText';
import {DataSource} from './components/DataSource';
import {ComponentDefinition, PluginDefinition} from './types';

export * from './types';
export * from './components/RichText';
export * from './components/Hero';
export * from './components/Divider';
export * from './components/Heading';
export * from './components/Button';
export * from './components/Image';
export * from './components/Grid';
export * from './components/Card';

const components: ComponentDefinition[] = [
  {
    name: 'Heading',
    component: Heading,
    description: 'A structural heading text',
    icon: 'heading',
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
    icon: 'text',
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
  {
    name: 'Image',
    component: Image,
    description: 'A visual media block',
    icon: 'image',
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
    icon: 'hero',
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
    icon: 'divider',
    defaultProps: {},
    schema: [],
  },
  {
    name: 'Grid',
    component: Grid,
    description: 'A responsive grid layout container',
    icon: 'grid',
    canHaveChildren: true,
    defaultProps: {
      columns: 3,
      gap: 'md',
    },
    schema: [
      {
        name: 'columns',
        label: 'Columns / Slots',
        type: 'select',
        options: [
          {label: '1 Column', value: 1},
          {label: '2 Columns', value: 2},
          {label: '3 Columns', value: 3},
          {label: '4 Columns', value: 4},
          {label: '5 Columns', value: 5},
          {label: '6 Columns', value: 6},
        ],
      },
      {
        name: 'gap',
        label: 'Gap Size',
        type: 'select',
        options: [
          {label: 'None', value: 'none'},
          {label: 'Small', value: 'sm'},
          {label: 'Medium', value: 'md'},
          {label: 'Large', value: 'lg'},
        ],
      },
    ],
  },
  {
    name: 'Card',
    component: Card,
    description: 'A flexible content card',
    icon: 'card',
    canHaveChildren: true,
    defaultProps: {
      title: 'Card Title',
      padding: 'md',
      shadow: true,
      border: true,
    },
    schema: [
      {name: 'title', label: 'Title', type: 'text'},
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
    ],
  },
  {
    name: 'DataSource',
    component: DataSource,
    description: 'A data loop container that fetches schema records and renders children for each record',
    icon: 'grid',
    canHaveChildren: true,
    defaultProps: {schemaSlug: '', limit: 10, sortDirection: 'DESC'},
    schema: [
      {name: 'schemaSlug', label: 'Schema', type: 'select', options: []},
      {name: 'limit', label: 'Records', type: 'number'},
      {name: 'sortDirection', label: 'Sort Order', type: 'select', options: [
        {label: 'Newest First', value: 'DESC'},
        {label: 'Oldest First', value: 'ASC'},
      ]},
    ],
  },
];

export const plugin: PluginDefinition = {
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
