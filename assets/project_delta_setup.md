## Project Delta Setup
## Basics
### Formatting
Link to [obsidian basics](https://help.obsidian.md/Editing+and+formatting/Basic+formatting+syntax) (aka. how to format text the way you want)
- You can also use the right click menu to select the formatting you want to apply to a section and to insert things like tables, links, etc. 
- This [page](https://obsidian.rocks/getting-started-with-obsidian-a-beginners-guide/#Create-your-first-note) also has good tips on using obsidian and writing markdown (obsidian uses a slightly modified version of markdown so there is some extra syntax for making links to internal files and )
- See the Project Delta Obsidian Markdown Cheat Sheet for a quick reference
### View Modes
In the bottom right (and top right) there are buttons to allow you to change the viewing mode
- :LiBookOpen: is reading mode. and shows exactly what the document would look like if viewed on the web or as a pdf
- :LiPencilLine: is live preview and shows a view of what the document will render to look like (aka. approximately what reading view will show) but allows you to edit the document
- :LiCodeXml: is source mode and shows the source file with minimal formatting applied incase you are try to fix weird formatting things or just want to edit the raw text without fighting with the formatting
## How to use this vault
### Making New Project Notes
The command pallet can be opened using `ctrl-p` or `command-p`. From there select "QuickAdd: Run QuickAdd" and then "Create New Project". A window will pop up asking if you what you would like to change the name of your project to. If the name is already in use or no name is entered you will be asked to input the project name again. If this menu is exited or cancel is pressed then the project files will still be made (due to limitations of the QuickAdd plugin) but they have a very long and random name that is easy to find and they can be deleted.

If everything works as expected then two files will be made a project file and a project milestones file. These are linked together so that all the sections will work as expected and you can just start adding your notes (Note:)
### Keyboard Shortcuts
The basic shortcuts for making text **bold**, and *italic* should work as normal.

For less common formatting, the below keyboard shortcuts insert html into your document to apply the desired formatting. We can change the shortcuts later so they are more mac friendly (settings :LiRightArrow: hotkeys). This doesn't mean much in terms of actual use but the process will go like this:
ex. text to format :LiArrowRight: ==text to format== :LiArrowRight: `<sup>text to format</sup>` :LiArrowRight: <sup>text to format</sup>
- `ctrl-shift-=` :LiArrowRight: will <sup>superscript</sup> highlighted text
- `ctrl-shift--` :LiArrowRight: will <sub>subscript</sub> highlighted text
- `ctrl-u` :LiArrowRight: will <u>underline</u> highlighted text

More shortcuts can be added later if you want (for adding footnotes, etc.).
## How to use some of the community plugins
### Iconize
Use this to add icons (like I did above to explain the reading modes). It is trigger by typing a `:`. Once you start to type after that symbol (important, do *not* include a space) a suggestion menu will pop up and help you choose exactly what symbol you want. ex.
- general format is `:<icon name>:`
- :LiQuestionMarkGlyph: is produced by typing using `:LiQuestionMarkGlyph:`
- 🥔is made by using `potato`[^1]
- :LiHeart: is made by using `LiHeart`

I do not know of an easy way to style these currently (aka. fill and colour).

[^1]: This example is just an emoji and can't be edited once added. Also you can just ad emojis the way you usually might and that will work too. I just wanted to include a potato for obvious reasons
