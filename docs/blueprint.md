# **App Name**: Scene Weaver

## Core Features:

- Narrative Import: Import narrative data structured as Story → Chapter → Arc → Moment from a JSON file.
- Reference Shelf: Implement a Reference Shelf for quick lookups of authored lore, active characters, and available equipment.
- Scene Generation: Generate a SceneDescriptor by selecting a Moment and combining it with runtime context. Assembles relevant entities like characters and assets and provides multiple response options, given a context.
- Restriction Service: Implement a Restriction Service to validate and filter content based on defined guardrails. The restrictions functionality will act as a tool and determine what pieces of information it will consider, given the restrictions provided.
- Scene Display: Display the generated SceneDescriptor, including narrative text, mood, assets, and party/equipment call-outs.
- Scene Diagnostics: Expose a diagnostics panel summarizing applied restrictions, mood adjustments, and branching probabilities.
- Generate Next Scene Action: Provide a button to trigger the Dreamweaver pipeline and refresh the Scene Descriptor View Model.

## Style Guidelines:

- Primary color: Deep indigo (#4B0082) to evoke a sense of mystery and creativity, referencing the limitless nature of stories.
- Background color: Light gray (#F0F0F0), providing a neutral backdrop that highlights content.
- Accent color: Vivid lavender (#E6E6FA) for interactive elements, contrasting against the indigo to draw attention.
- Body text and headline font: 'Literata', a transitional serif with a literary feel.
- Use a grid-based layout to organize the different sections of the scene desk, such as story selection, scene display, and diagnostics panel. Maintain a clean and structured aesthetic to minimize distraction.
- Use simple, outline-style icons to represent different elements of the narrative and scene generation process. Ensure that icons are intuitive and consistently applied across the user interface.
- Incorporate subtle animations when loading and transitioning between scenes. Use animation to enhance the user experience without being distracting.