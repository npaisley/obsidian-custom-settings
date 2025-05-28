# Metadata Styling Options
All metadata styling (icon, title, color, etc.) can be combined by putting them into the metadata field and space separating them (ex. `> [!<note type>|<metadata> <metadata>]`). This allows multiple options to be used without interfering with each other. Option keywords must be given exactly and are case sensitive.

## Title bar modifications
> [!landmark|no-icon] `no-icon`
> > [!note]
>> sub note retains icon

> [!landmark|no-title]
> `no-title`
> Can also be achieved using `> [!|]` but this metadata keyword allows for styling the callout
> > [!drink]
>> sub callout retains title

> [!note|hide-title-bar]
> Callout content for `hide-title-bar`

## sub callout styling

> [!note]+ sub callout styles
> 
> > [!reading|inherit-parent-callout-colour]+ `inherit-parent-callout-colour`
> > sub note content
> > - 1
> > - 2
> > - 3
>
>> [!tldr|fitted-sub-callout]+ `fitted-sub-callout`
>> alias: `fitted`
>> - 1
>> - 2
>> - 3
>
> More content
>
>> [!reading|fitted]+ `fitted`
>> Callout content
>> - 1
>> - 2
>> - 3

## Colour overriding

> [!note] original

> [!note|light-gray] light-gray

> [!note|medium-gray] medium-gray

> [!note|dark-gray] dark-gray

> [!note|yellow] yellow

> [!note|orange] orange
 
> [!note|burnt-orange] burnt-orange
 
> [!note|red] red

> [!note|dusty-rose] dusty-rose
 
> [!note|grapefruit] grapefruit

> [!note|light-green] light-green

> [!note|medium-green] medium-green
 
> [!note|dark-green] dark-green

> [!note|forest-green] forest-green
 
> [!note|light-blue] light-blue

> [!note|medium-blue] medium-blue
 
> [!note|dark-blue] dark-blue
 
> [!note|purple] purple

> [!note|violet] violet

> [!note|gold] gold

> [!note|cyan] cyan
## transparent and intense callout colours

>[!note|transparent] transparent

> [!note|purple intense] purple intense

## Border Styling
4 widths (`bw1`, `bw2`, `bw3`, `bw4`) and options for where the border is to go (all: `-A`, left: `-L`, top: `-T`, right: `-R`, bottom: `-B`). Must be used as a single keyword (ex. `bw1-R`) but multiple can be used. Examples:

> [!NOTE|bw1-R] `bw1-R`
> Contents

> [!NOTE|bw4-T bw2-B] `bw4-T bw2-B`
> Contents

> [!NOTE|bw4-A] `bw4-A`
> Contents

> [!NOTE|bw2-R] `bw2-R`
> Contents

> [!NOTE|borderless] `borderless`
> Contents

## Empty container callout

> [!container]
> main content of `container-callout`

## Example(s) using multiple metadata options

> [!NOTE|lightGreen borderless]
> 
> > [!warning|bw3-T bw3-B light-blue fitted]+ Title
> > Contents
>
>> [!NOTE|fitted bw3-T bw3-B transparent dusty-rose]+
> > more content