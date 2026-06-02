import {RichText} from './components/RichText';
import {Hero} from './components/Hero';
import {Divider} from './components/Divider';
import {Heading} from './components/Heading';
import {Button} from './components/Button';
import {Image} from './components/Image';

export * from './components/RichText';
export * from './components/Hero';
export * from './components/Divider';
export * from './components/Heading';
export * from './components/Button';
export * from './components/Image';

export const corePlugin = {
  name: '@gustav/core-plugin',
  components: [
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
      ],
    },
    {
      name: 'Divider',
      component: Divider,
      description: 'A horizontal line',
      defaultProps: {},
      schema: [],
    },
  ],
};
