# Evaluating Singing Input Data

-   `time.csv` lists the `Total Time` and the `Sing Time` for every trial.
    Note that each trial results in two rows: one with the `Total Time` and one
    with the `Sing Time`.
-   `error.csv` states the `Error rate` for every block of 14 trials. The rate
    is a number between 0% and 100%.
-   `tlx.csv` indicates the TLX ratings (on a scale from 1-7) for each
    technique (pitch, interval, and melody) and participant. Skill is enumerated
    such that `0 = Novice` and `2 = Expert`. `Enjoyability` refers to the
    enjoyability of the technique (7 is good) and background music refers to
    whether the background music made it easier (7) or harder (1).
-   `discussion-pitch-semitones.csv` indicates how far the detected pitch was
    from the target for every pitch trial at every time step. Time is normalized
    for every trial from 0 to 1, where time 0 is the time of the first pitch
    detected in the trial and 1 is the time of the last pitch detected in the
    trial.
-   `discussion-granularity-error.csv` indicates the error rate for every
    block when using a granularity of 3, 7, and 12. This is based on a post-hoc
    simulation using logs.
-   `discussion-melody-confusion.csv` indicates what each melody was confused
    with for every trial in the melody technique.
-   `discussion-melody-error.csv` indicates the error rate for every block
    in the melody technique when using a set of 7 melodies compared to using 4.
