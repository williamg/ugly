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

### Options
There are a few command line options available:
- `-p`: Change the port used to  serve the client (default is `3333`). (*Make sure this is not set to `4444` as that port is the hard-coded WebSocket port*)
- `-l`: Change where the log file is written (default is `'ugly.log'`)
- `-r`: The framerate at which the server will try to send frames. (default is `120`) Note that the rate at which ugly sends frames has nothing to do with the rate it receives commands. So it can receive all the commands at once and still render them  at the right speed. This is helpful if you have a pre-generated ugly script:

        cat uglyScript | ugly -r 60

    If you are generating commands in realtime, as long as the rate is a positive multiple of your actual framerate, ugly will keep up with your program and render in as-close-to-realtime as it can.

### Commands
To learn more about the commands supported by **ugly**, please refer to the wiki page:
[Commands](https://github.com/williamg/ugly/wiki/Commands)
