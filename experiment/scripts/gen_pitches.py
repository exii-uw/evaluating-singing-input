# Script to generate a sequence of pitch tasks where no
# adjacent tasks are identical.

import random
import sys

if len(sys.argv) < 2 or len(sys.argv) > 3:
    print('Usage: python3 gen_pitches.py [# of blocks] [(easy)]')
    sys.exit(1)

pitches = [0, 2, 4, 5, 7, 9, 11]

if len(sys.argv) > 2 and sys.argv[2] == 'easy':
    pitches = [0, 4, 7]

pitches *= int(sys.argv[1])
random.shuffle(pitches)

# Make sure never have two in a row
is_ok = False
while not is_ok:
    is_ok = True
    for i in range(1, len(pitches)):
        # If we have two in a row, swap the number with another rando
        if pitches[i] == pitches[i - 1]:
            is_ok = False
            j = i
            while j == i:
                j = random.randint(0, len(pitches) - 1)
            temp = pitches[i]
            pitches[i] = pitches[j]
            pitches[j] = temp

print(pitches)
