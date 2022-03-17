![](https://vinizinho.neocities.org/figures/tree-renderer-ex1.png)

# tree-renderer

A webtool for visualizing simple tree-structured data. 

## Why?

I developed this tool to facilitate exploratory analysis of decision trees. However, it is generic enough to be usable by any kind of flowchart-like structure, so I'm leaving it here.

Can be seen as a tree-focused alternative to MermaidJS's Live Editor.

## Input format

The input text must be structured appropriately. Each line corresponds to a node, and the number of `-`s corresponds to the node's depth.

Example:

```- Velocity <= 0.5
-- Position > 7.2
--- LEFT
--- Angle <= 30
---- YES
---- NO
---- Maybe?
-- LEFT
-- RIGHT
--- OH, RIIIGHT...
```

![](https://vinizinho.neocities.org/figures/tree-renderer-ex5.png)
