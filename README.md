# ugly

Ugly is a light-weight language-agnostic graphics library.

**Why does this exist?**
- The canvas API is very nice, but Javascript isn't as powerful as low-level languages like C
- Low level languages like C require lots of hoop-jumping before you can easily draw on the screen

**ugly** solves both of these problems. Harnassing a simple text-stream interface between programs, **ugly** takes in
commands in real-time and forwards them via WebSockets  to a local Javascript client, rendering your drawings on an
HTML5 canvas for your viewing pleasure.

## Installation
Simply clone the repo, and install:

    git clone https://github.com/williamg/ugly.git
    cd ugly
    npm install -g

## Usage
To use **ugly**, make sure your application outputs text according to the
[**ugly** protocol](https://github.com/williamg/ugly/wiki/Protocol) on standard out.

    yourprogram | ugly

Now, head to `localhost:3333/viewer/` and enjoy the show!

### Commands
To learn more about the commands supported by **ugly**, please refer to the wiki page:
[Commands](https://github.com/williamg/ugly/wiki/Commands)
