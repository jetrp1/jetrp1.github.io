+++
title = 'One Billion Row Challenge in Python'
author = "Ryan Peel"
date = '2025-03-15'
draft = false
description = "This post documents my attempt at the 1 Billion Rows Challenge using pure Python, focusing on optimizing file reading, parallel processing, and data parsing for performance gains. Through various improvements, I reduced execution time from 1733 seconds to 144 seconds, demonstrating significant speedup without external dependencies."
categories = [
    "Performance Optimization",
]
tags = [
    "Python", 
]
series = ["Coding Challenges"]
aliases = ["One-Billion-Row-Challeng-in-Python"]
toc = false
+++

# 1BRC in Python

This is my attempt at the 1 Billion Rows Challenge in Python.

[Original Challenge](https://github.com/gunnarmorling/1brc)  
[My Code](https://github.com/jetrp1/1brc)

## Inspiration and Attribution

Some ideas for this came from a few sources, listed below:
- Doug Mercer [video](https://www.youtube.com/watch?v=utTaPW32gKY&t=125s)
- [Discussion](https://github.com/gunnarmorling/1brc/discussions/62) from the official repo

While I could simply follow these and have a working, fast implementation, that would not help me learn. So, while I am taking ideas from these sources, I am not following them exactly. However, I expect that my implementation will be fairly similar by the time I am done.

## Measurement

I'll use `hyperfine` to benchmark my script, running three tests with one warm-up run and the time is an average of 3 runs.

## Data Generation

I am using a `create_measurements.py` file that I built myself since I do not want to install a Java environment on my system. You can find it in the repo, and I even performed a bit of speed analysis on it.

## Goal / Target

I have created a baseline to work from. It is quite poor, averaging around 25 minutes on my machine. I ran Doug Mercer's "doug booty v4" version on my machine, and it completed in around 2 minutes. My goal is to get to a similar range.

Some things to note:
- My machine is significantly slower than others in the competition.
- I do not have enough RAM to start a RAM disk like many other competitors.

These two factors contribute to my script running much slower than the time Doug gets in his video.

## Diagnostic Tools

Some tools I used:
- Multiple sizes of measurement files
- `hyperfine`
- `time` (GNU tool)
- `viztracer` (python profiler)

## Optimization Ideas

Some ideas for optimizing this code:
- Parallel Processing
- String parsing improvements
- Using PyPy
- Faster file reading
- Using a flamegraph to identify bottlenecks

### PyPy Performance

PyPy3 has shown to improve performance in many projects, so I'll run most of my tests using PyPy moving forward. Below are the differences in baseline time using PyPy3 versus CPython3.

| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `pypy3 ./calculate_average_baseline.py ./measurements/1B_Measurements.csv` | 979.168 ± 3.948 | 976.766 | 983.724 | 1.00 |
| `python3 ./calculate_average_baseline.py ./measurements/1B_Measurements.csv` | 1733.957 ± 11.034 | 1721.578 | 1742.757 | 1.77 ± 0.01 |

### File Reading

I initially tested different file read modes by creating three scripts that only read the file line by line without any processing.

| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `pypy3 ./ca_r.py ./measurements/100M_Measurements.csv` | 16.624 ± 0.565 | 15.996 | 17.091 | 1.88 ± 0.06 |
| `pypy3 ./ca_rb.py ./measurements/100M_Measurements.csv` | 8.841 ± 0.024 | 8.817 | 8.864 | 1.00 |
| `pypy3 ./ca_r+b.py ./measurements/100M_Measurements.csv` | 15.350 ± 0.422 | 14.982 | 15.810 | 1.74 ± 0.05 |

Binary mode (`rb`) had a significant speedup, but the extra work needed to parse binary data may negate this improvement. I tested this with full script modifications.

| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `pypy3 ./calculate_average_r.py ./measurements/100M_Measurements.csv` | 100.081 ± 0.838 | 99.287 | 100.958 | 1.46 ± 0.01 |
| `pypy3 ./calculate_average_rb.py ./measurements/100M_Measurements.csv` | 68.539 ± 0.283 | 68.349 | 68.864 | 1.00 |

For 1 billion rows:

| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `pypy3 ./calculate_average_rb.py ./measurements/1B_Measurements.csv` | 666.263 ± 5.518 | 660.911 | 671.934 | 1.00 |

### Parallel Processing

Parallel processing is expected to be the biggest improvement. I created a dispatcher function that dynamically chooses the number of cores to use unless specified.

| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `pypy3 ./calculate_average_mt.py ./measurements/1B_Measurements.csv` | 246.554 ± 0.181 | 246.352 | 246.700 | 1.00 |

### Using Memory Mapping (mmap)

Many competitors use `mmap` for file reading. My concern was that I only have 16GB of RAM, while the file size is 14GB. However, my system did not crash, and performance improved.

| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `pypy3 ./calculate_average_mmap.py ./measurements/1B_Measurements.csv` | 189.611 ± 0.293 | 189.359 | 189.932 | 1.00 |

### String Parsing and Using Integers Instead of Floats

String parsing is expensive. Since our data is uniform, I replaced `split()` with direct indexing using `find()`. Additionally, since all values have one decimal place, I converted them to integers instead of floats.

The code is less readable but much faster.

| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `pypy3 ./calculate_average_int.py ./measurements/1B_Measurements.csv` | 144.804 ± 0.524 | 144.327 | 145.365 | 1.00 |

## Final Results

With all optimizations, I reduced execution time from **1733 seconds to 144 seconds**. This meets my goal and represents a massive improvement! 🚀

