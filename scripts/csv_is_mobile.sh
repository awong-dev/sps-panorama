#!/bin/bash

set -x

# Run like
# $ ./csv_is_mobile.sh ~/survey_data.csv  > is_mobile.csv  
#
# Then import is_mobile.csv into excel/Google sheets and copy/paste the column which
# should be in the same sort-order as the survey_data.csv.

# All columns before 17 don't have embedded commas.
# Use cut to include a lot of extra commas incase the User Agent stirng has a bunch.
# Then use sed to remove the leading quote mark since some of the entries are quoted and others are not (wtf)
# Next, for rows that were quited, splitting on the " will give the full user agent.
# For the remaining rows, we know there's a fixed number of trailing comma clauses to remove. Use sed anchored at the end for that.
# Finally, run through is_mobile.php to produce a list that can imported into excel/google sheets and copy/pasted into the right spot.
cat "$1" | cut -d ',' -f17,18,19,20,21,22,23,24,25,26,27,28 | sed -e 's/^"//' | cut -d '"' -f1 | sed -e 's/\(,[^,]*\)\{10\},$//' | php is_mobile.php
