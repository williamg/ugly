import sys
import time
import random

# ==============================================================================
# Simple midpoint displacement visualization
# ==============================================================================

# CONSTANTS
NUM_ITERATIONS = 10

HEIGHT = 480;
WIDTH = 640;

FG_HEIGHT = 200
FG_ROUGHNESS = 50
FG_COLOR = '244 164 96 0.5'

BG_HEIGHT = 400
BG_ROUGHNESS = 200
BG_COLOR = '160 82 45 1'

# Generate a layer tuple
def getLayer (height, roughness, color):
    # Starting rectangle
    points = [(0, HEIGHT), (0, HEIGHT - height), (WIDTH, HEIGHT - height),
              (WIDTH, HEIGHT)]

    return (roughness, color, points)

# Write a config chunk
def writeConfig ():
    sys.stdout.write ('$CONFIG\n')
    sys.stdout.write ('canvas_size ' + str (WIDTH) + ' ' + str (HEIGHT) + '\n')
    sys.stdout.write ('fullscreen false\n')
    sys.stdout.write ('letterbox_color 0 0 0\n')
    sys.stdout.write ('$END_CONFIG\n')
    sys.stdout.flush ()

# Iterate a layer
def iterate (layer, i):
    points = layer[2]
    numMidpoints = 2 ** i
    scale = (0.5 ** i) * layer[0]
    ind = 1

    for i in xrange (1, numMidpoints+1):
        left = points[ind]
        right = points[ind+1]

        x = (left[0] + right[0]) / 2.0
        y = (left[1] + right[1]) / 2.0
        displacement = (2 * random.random () - 1) * scale
        y = y + displacement

        points.insert (ind+1, (x, y))
        ind = ind + 2

    return (layer[0], layer[1], points)

def writeFrame (layers):
    sys.stdout.write ('$FRAME\n')

    # Draw the sky
    sys.stdout.write ('fill_style_linear_gradient 0 0 ' + str (WIDTH) + ' '
                      + str(HEIGHT) + ' 0 25 25 112 1 1 102 205 170 1\n')
    sys.stdout.write ('fill_rect 0 0 ' + str (WIDTH) + ' ' + str (HEIGHT) + '\n')

    # Draw each layer
    for layer in layers:
        points = layer[2]
        sys.stdout.write ('fill_style_color ' + layer[1] + '\n')
        sys.stdout.write ('begin_path\n')
        sys.stdout.write ('move_to ' + str (points[0][0]) + ' ' + str (points[0][1]) + '\n')

        for point in points:
            sys.stdout.write ('line_to ' + str(point[0]) + ' ' + str (point[1]) + '\n')

        sys.stdout.write ('close_path\n')
        sys.stdout.write ('fill\n')

    sys.stdout.write ('$END_FRAME\n')
    sys.stdout.flush ()

def run ():
    layers = []
    layers.append (getLayer (BG_HEIGHT, BG_ROUGHNESS, BG_COLOR))
    layers.append (getLayer (FG_HEIGHT, FG_ROUGHNESS, FG_COLOR))

    writeConfig ()
    writeFrame (layers)

    # Give the viewer a change to load
    time.sleep (5)

    for i in xrange (0, NUM_ITERATIONS):
        updatedLayers = []
        for layer in layers:
            layer = iterate (layer, i)

        writeFrame (layers)

        # Sleep so that the change is visible
        time.sleep (1)

run ()
