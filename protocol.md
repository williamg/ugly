# Ugly Protocol
####**v1.0.3**

---



##Introduction
This document defines format expected by **ugly** to render graphics.

### Terminology
**ugly** epxects data to be divided into *chunks*. A chunk is simply a group of
related commands. Currently, **ugly** supports two types of chunks:
- **CONFIG** - Config chunks define settings that will be used throughout the
render such as background color, aspect ratio, etc.
- **FRAME** - A frame chunk defines the commands that will be run on a
particular frame.

### Syntax
The **ugly** syntax is fairly straightforward. Every chunk declaration and every
command should be on its own line. Additionally, every parameter for a given
command should be separated by at least one space.

To declare a chunk simply output its name on its own line prefixed by a `$`.
After you've finished declaring all the commands for a particular chunk, you
should close the chunk by writing the chunk name prefixed by `$END_` on a
new line.

**Example**:

```
$CONFIG
command_baz param param
command_foo
command_bar param
$END_CONFIG
```

## Commands
### Config Commands

<table>
    <tbody>
        <tr>
            <th align="left">Command</th>
            <th align="left">Description</th>
            <th align="left">Defaults</th>
        </tr>
        <tr>
            <td><pre>letterbox_color #rrggbb</pre></td>
            <td> Sets the color for the portions of the page not covered by the canvas
            <td><pre>letterbox_color #000000</pre></td>
        </tr>
        <tr>
            <td><pre>canvas_size width height</pre></td>
            <td> Sets the size of the canvas in pixels
            <td><pre>canvas_size 640 480</pre></td>
        </tr>
    </tbody>
</table>

### Frame Commands
<table>
    <tbody>
        <tr>
            <th align="left">Command</th>
            <th align="left">Description</th>
        </tr>
        <tr>
            <td><pre>fill_style_color r g b a</pre></td>
            <td>Sets a color to be used as the fillStyle for the canvas.
            RGB values should be integers from 0 to 255. Alpha should be a
            decimal from 0-1.</td>
        </tr>
        <tr>
            <td><pre>fill_rect x y width height</pre></td>
            <td>Fill a rectangle with the top left corner at x y with the given
            width and height.</td>
        </tr>
    </tbody>
</table>

