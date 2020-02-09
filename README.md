# Seattle Public Schools Panorama Hacking

## Something is right! Something is wrong! How do I tell you?
Please [submit an issue](https://github.com/awong-dev/sps-panorama/issues)!

I hacked this together super fast for school choice, so I'm sure
there are *lots* fo bugs. Send me bug reports or pull requests and
I'll fix as I get time.

## What is this?
The Seattle Public Schools conduct a survey each year of students, staff, and
families for grades 3-12. The data is available online at
[Panorama Education](https://secure.panoramaed.com/seattle/understand)'s website
and also as an Excel file off the School District's
[School Surveys page](https://www.seattleschools.org/district/district_scorecards/school_surveys).

The Excel file is just raw data written as a sparse matrix that is fairly
hard to work through.

The Panorama site has great view of data if you want to drill down in to a
specific question, but it's not set up for comparing school to school. There
is some ability to compare the averages per category, but a lot of information
is lost in the averages and it's hard to figure out what differentiates a
school.

This tool instead takes the data and allows side-by-side comparisons of
schools. One specific difference in data presentation is the individual
questions are considered independent evaluations for the school and are
sorted so the the questions where a set of school had the *most different*
answers show up first.

As this is survey data, it's hard to directly compare two schools even for
the same question. If School A gets 51% agree and School B gets 48% agree,
what does that really mean? Likely not much in isolation.

What's more useful is to look at the distribution of answers. Are respondents
polarized (lots of agree/disagree but no neutral)? Are there multiple
related questions that bubble to the top and show a trend? (eg, do all of
Pride in school, Respect for teachers, Feeling of Safety,
Belief that bullying is handled, etc. show up high in the list?)

This seems like it can generate a better story for the school than looking
at data individually.


## Basic instructions
1. Install [nvm](https://github.com/creationix/nvm)
2. Developed on node LTS v12
3. Run `npm install` To install all the stuff in packages.json
4. Run `npm run watch`. This will run a "webpack dev server" that will effectively compile/run your code as you edit files.
5. Navigate to `localhost:8080/webpack-dev-server/`. Note the trailing slash is important.
