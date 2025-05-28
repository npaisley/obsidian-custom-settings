# Obsidian Markdown Guide

# Headers
---
Headers are available from level 1 to 6 (H1–H6)
# Header 1
`# Header 1`
## Header 2
`## Header 2`
### Header 3
`### Header 3`
#### Header 4
`#### Header 4`
##### Header 5
`##### Header 5`
###### Header 6
`###### Header 6`

# Text Formatting
---
## Basic Markdown
`**Bold text**` :LiArrowRight: **Bold text**
`*Italic text*` :LiArrowRight: *Italic text*
`***Bold italic text***` :LiArrowRight: ***Bold italic text***
` \= =Hightlighted text== ` :LiArrowRight: ==Highlighted text==
`~~Strikethrough text~~` :LiArrowRight: ~~Strikethrough text~~
## Formatting via HTML
`<sup>superscript</sup>` :LiArrowRight: <sup>superscript</sup>
`<sub>subscript</sub>` :LiArrowRight: <sub>subscript</sub>
`<u>underline</u>` :LiArrowRight: <u>underline</u>
# Links
---
To create a link to a webpage `[text to dislay](website url)`
`[Obsidian Help](https://help.obsidian.md/) `
[Obsidian Help](https://help.obsidian.md/)

To link to a page in your vault (create a local link) `[[note name]]`
`[[Welcome]] `
[[Welcome]] 

To link to a header in your vault (another local link) `[[note name#header]]`
`[[Welcome#How to use this vault]] `
[[Welcome#How to use this vault]] 

To change the text for a local link use the | character `[[note name|display text]]`
`[[Welcome|Welcome page]]`
[[Welcome|Welcome page]]

To embed the linked note add a ! in front of the link `![[note name]]`
`![[Welcome#Making New Project Notes]] `
![[Welcome#Making New Project Notes]] 
# Images
---
Images can be added and rendered in notes in a similar fashion to regular links. Using square brackets alone will add a link to the note but including a `!` at the front will add the image directly to your text. Adding a `|` within the brackets but directly after the image name can be used to name the link (in the case of un-rendered images) or resize the image (in the case of rendered images). To resize the image the text after the `|` can only contain numbers and represents the width in pixels that you would like the image to be. If no height is provided than the image will retain its original aspect ratio.
`[[name of image]]`
`![[name of rendered image]]`
`![alt text|200](url of network image)`
`![[name of resized image|300]]`
`![[name of resized image|300x400]]`

![Obsidian logo|100](https://obsidian.md/images/obsidian-logo-gradient.svg)

Images can be pasted into a note and they will be automatically added to a folder named "assets" in the same folder as the note. The exact location of the image within your vault doesn't matter for linking to it, it just has to have a unique name.
# Lists
---
Three types of lists are available:
Unordered:
`- list item`
- Item 1
- Item 2
- Item 3

Ordered:
`1. list item`
1. Item 1
2. Item 2
3. Item 3

Tasks:
`- [ ] task item`
`- [x] finished task item`
- [ ] Task 1
- [ ] Task 2
- [x] Finished Task 3
# Tables
---
Tables can be inserted using the right click menu[^2] or by typing in the table syntax. Once recognized, in live preview mode obsidian will render the table and include some nice buttons to add more or reorganize the rows and columns.
```md
| table    | header | items |
| -------- | ------ | ----- |
| this     | is     | a     |
| markdown | table  | !     |
```

| table    | header | items |
| -------- | ------ | ----- |
| this     | is     | a     |
| markdown | table  | !     |

# Code
---
Inline code can be added by using backticks(\`) to surround the section of text.
```md
This line of text has `inline code` in it.
```
This line of text has `inline code` in it.

A block of code can be included by surrounding the lines with triple backticks (` ``` `)
![[Pasted image 20250219141518.png|600]]
```md
this 
is
a
code
block
```
By adding the name of the coding language after the first set of backticks you can enable syntax highlighting (ex. will highlight the different parts of python code). Many plugins use this feature to render something entirely different based on what was written in the block (ex. Dataview and Tasks).
# Tags
---
Any text that starts directly with a `#` will be counted as a tag. Spaces cannot be used between words in a tag. Tags can be nested by adding a `/` between the different levels. These are useful for marking notes (when the tags are included in the properties or frontmatter) or sections of notes so that you can find associated ideas or content more easily later.

`#tag_name`
`#tag_name/sub_tag`
#markdown
#markdown/obsidian
# Math
---
Mathematical equations can be rendered inline or in a block style. This works well when done properly but can be really really annoying to get to work right. A website like [codecogs](https://editor.codecogs.com/) can help you figure your equations out. Chemical formulas can be more easily added by including `\require{mhchem}` at the beginning of the math block. 

Inline:[^3]
`$equations to render$`
$PV = nRT$

Block/multiline:
```latex
$$
\require{mhchem}
\begin{gathered}
PV = nRT \\
r = \pi r^{2} \\
\frac{1}{2x} = \sqrt{x+y} \\
\ce{2NOCl_{(g)} \rightleftharpoons 2NO_{(g)} + Cl2_{(g)}} \\
\ce{C6H5O} \\
\ce{$A$ ->[\ce{+H2O}] $B$} \\
\ce{SO4^2- + Ba^2+ -> BaSO4}
\end{gathered}
$$
```
$$
\require{mhchem}
\begin{gathered}
PV = nRT \\
r = \pi r^{2} \\
\frac{1}{2x} = \sqrt{x+y} \\
\ce{2NOCl_{(g)} \rightleftharpoons 2NO_{(g)} + Cl2_{(g)}} \\
\ce{C6H5O} \\
\ce{$A$ ->[\ce{+H2O}] $B$} \\
\ce{SO4^2- + Ba^2+ -> BaSO4}
\end{gathered}
$$
# Comments
---
You can make comments in the source view or live preview of the document by wrapping the text in \%% signs. When The document is viewed in reading mode none of the commented text will be visible
`%%comment%%`
%% comment %%
# Quotes and Callouts
---
A line can be included in a quote block by prefixing it with > followed by a space.
`> quoted text`
> quoted text

```md
> Multi
> Line
> Quoted
> Text
```
>Multi
>Line
>Quoted
>Text

Callouts are made in a similar fashion except that the line `> [!note type]` must be the first line of the block.
```md
> [!note] callout title
> callout content

normal text content

> [!note]+
> foldable callout content
```
> [!note] callout title
> callout content

normal text content

> [!note]+
> foldable callout content

If the title is omitted then the title of the callout will be the type of callout. A blank line should be included after the callout (aka. no >) to continue adding content without adding it to the callout.

If a `-` or a `+` is added after the callout it will become foldable (by clicking it). Using a `-` will make the callout default to closed and `+` will make it default to open (aka. the state they are in when the note is opened).

Multiple types of callouts are available ([[callout options and examples]] shows all of the ones available with obsidian and some others that I have added). 
# Horizontal Lines
---
typing a line with three -'s (`---`) will render a line that goes across the page (like I have done after each header on this page)
# Footnotes
---
Footnotes are added by typing a `[^number]`[^1]. This will open a window in which you can type your footnote content. The content will be added to the end of the note.

[^1]: This is a footnote

[^2]: ![[Pasted image 20250219140634.png|300]]

[^3]: Do **not** include spaces after the first `$` or before the second or the equation will not render properly. Aka. good: `$equation$`, bad: `$ equation $`.
