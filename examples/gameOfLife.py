import sys, time, random

HEIGHT = 500;
WIDTH = 500;

CELLSX = 50;
CELLSY = 50;

CELLSIZEX = WIDTH / CELLSX;
CELLSIZEY = HEIGHT / CELLSY;

LINES_COLOR = '255 255 255 0.3'
CELLS_COLOR = '255 255 255 0.5'

#naive and ugly implementation :)
def iterate (cells_map):
    cells_map_new = [[0 for x in range (CELLSX)] for y in range (CELLSY)]
    for cx in range (CELLSX):
        for cy in range (CELLSY):
            sum = 0
            sum += cells_map[ (cx - 1) % CELLSX][ (cy - 1) % CELLSX]
            sum += cells_map[cx][ (cy - 1) % CELLSX]
            sum += cells_map[ (cx + 1) % CELLSX][ (cy - 1) % CELLSX]
            sum += cells_map[ (cx - 1) % CELLSX][cy]
            sum += cells_map[ (cx + 1) % CELLSX][cy]
            sum += cells_map[ (cx - 1) % CELLSX][ (cy + 1) % CELLSX]
            sum += cells_map[cx][ (cy + 1) % CELLSX]
            sum += cells_map[ (cx + 1) % CELLSX][ (cy + 1) % CELLSX]
            if cells_map[cx][cy]:
                if sum < 2 or sum > 3:
                    cells_map_new[cx][cy] = 0
                else:
                    cells_map_new[cx][cy] = 1
            else:
                if sum == 3:
                    cells_map_new[cx][cy] = 1
                else:
                    cells_map_new[cx][cy] = 0

    return cells_map_new



def writeConfig ():
    sys.stdout.write ('$CONFIG\n')
    sys.stdout.write ('canvas_size ' + str (WIDTH) + ' ' + str (HEIGHT) + '\n')
    sys.stdout.write ('fullscreen false\n')
    sys.stdout.write ('letterbox_color 0 0 0\n')
    sys.stdout.write ('$END_CONFIG\n')
    sys.stdout.flush ()

def writeFrame (cells_map):
    sys.stdout.write ('$FRAME\n')

    sys.stdout.write ('fill_style_linear_gradient 0 0 ' + str (WIDTH) + ' '
                      + str (HEIGHT) + ' 0 164 179 87 1 1 117 137 12 1\n')
    sys.stdout.write ('fill_rect 0 0 ' + str (WIDTH) + ' ' + str (HEIGHT) + '\n')

    sys.stdout.write ('stroke_style_color %s\n' % (LINES_COLOR))

    for x in range (CELLSX):
        sys.stdout.write ('begin_path\n')
        #sys.stdout.write ('move_to %d %d\n' % ( (x + 1)* CELLSIZEX, 0))
        sys.stdout.write ('line_to %d %d\n' % ( (x + 1)* CELLSIZEX, 0))
        sys.stdout.write ('line_to %d %d\n' % ( (x + 1)* CELLSIZEX, HEIGHT))
        sys.stdout.write ('close_path\n')
        sys.stdout.write ('stroke\n')

    for y in range (CELLSY):
        sys.stdout.write ('begin_path\n')
        #sys.stdout.write ('move_to %d %d\n' % (0, (y + 1)* CELLSIZEY)
        sys.stdout.write ('line_to %d %d\n' % (0, (y + 1)* CELLSIZEY))
        sys.stdout.write ('line_to %d %d\n' % (WIDTH, (y + 1)* CELLSIZEY))
        sys.stdout.write ('close_path\n')
        sys.stdout.write ('stroke\n')

    sys.stdout.write ('fill_style_color %s\n' % (CELLS_COLOR))

    for cx in range (CELLSX):
        for cy in range (CELLSY):
            if cells_map[cx][cy] == 1:
                cxx = CELLSIZEX * cx
                cyy = CELLSIZEY * cy
                sys.stdout.write ('fill_rect %d %d %d %d\n' % (cxx, cyy, CELLSIZEX, CELLSIZEY))

    sys.stdout.write ('$END_FRAME\n')
    sys.stdout.flush ()

def run ():
    cells_map = [[1 if random.random () > 0.8 else 0 for x in range (CELLSX)] for y in range (CELLSY)]
    writeConfig ()

    while True:
        cells_map = iterate (cells_map)
        writeFrame (cells_map)

        time.sleep (0.1)

run ()