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
- `-p`: Change the port used to  serve the client (default is 3333). (*Make sure this is not set to `4444` as that port is the hard-coded WebSocket port*)
- `-l`: Change where the log file is written (default is 'ugly.log')
- `-r`: Limit the rate of the viewer. If this is 60, for example, the server will try to send frames at approximately 60FPS. This is helpful if you have a pre-generated ugly script:

        cat uglyScript | ugly -r 60

    avoid this option if you are producing your script in real-time, though.

### Commands
To learn more about the commands supported by **ugly**, please refer to the wiki page:
[Commands](https://github.com/williamg/ugly/wiki/Commands)
