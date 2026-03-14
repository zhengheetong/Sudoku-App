# 🌆 Cyberpunk Sudoku Solver

A fully featured, client-side Sudoku Solver built with pure HTML, CSS, and Vanilla JavaScript. Wrapped in a sleek Cyberpunk aesthetic with Matrix digital rain, this app doesn't just solve Sudoku—it visualizes the logic, scans puzzles from images using Neural Networks (OCR), and provides a highly interactive step-by-step replay of the AI's thought process.

🌐 **Live Demo:** [Click Here to Play](https://zhengheetong.github.io/Sudoku-App/)

![Cyberpunk Sudoku Solver Preview](https://via.placeholder.com/800x450.png?text=Add+Screenshot+Here)

## ✨ Features

* 💻 **Cyberpunk Interface**: Neon glow effects, CSS glassmorphism, glitch text animations, and an animated Matrix digital rain background.
* 📷 **Image Scanning & Auto-Fill (OCR)**: Upload a picture of a Sudoku puzzle! The app uses **Cropper.js** to align the grid and **Tesseract.js** to extract the numbers and auto-fill the board.
* 🎛️ **Unified Tabbed Dashboard**: A sleek, side-by-side UI that seamlessly swaps between your scanned image references and the AI logic terminal without breaking the layout.
* 📺 **CRT Terminal Replay System**: Instead of just flashing the answer, the engine records every single logical deduction. Watch the AI's thought process unfold on a custom retro CRT monitor complete with screen glare and scanlines. 
* ⏱️ **Timeline Scrubber**: Use the playback controls (Auto-Play, Next, Prev) or drag the **Neon Timeline Slider** to scrub back and forth through hundreds of logic steps instantly.
* ⚡ **Cascading Fast Solve**: Solves the grid instantly in the background and reveals the answer with a satisfying top-left to bottom-right cascading animation.

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3, Vanilla JavaScript
* **Image Cropping**: [Cropper.js](https://github.com/fengyuanchen/cropperjs)
* **Optical Character Recognition**: [Tesseract.js](https://github.com/naptha/tesseract.js)
* **Fonts**: Google Fonts ('Inter' and standard Monospace)

## 🧮 How the AI Thinks (Algorithms)

Unlike simple solvers that just blindly guess numbers, this application features a persistent possibility state and applies real human Sudoku strategies. When you watch the Visual Solve replay, the numbers placed logically appear in **Blue**, while those placed after an estimation appear in **Purple**.

The engine calculates and displays **possibilities** (the small red numbers), logs them to the Terminal, and applies the following visual logic algorithms:

### 1. Naked Singles
The simplest deduction. If a cell has **ONLY ONE** potential candidate remaining in its possibility set, it must be that number.
~~~text
+-----------------+
| Possibilities:  |
| [ 5, 7, 9 ]     | <- Multiple candidates. Unsolved.
+-----------------+
| Possibilities:  |
| [ 4 ]           | <- NAKED SINGLE! This cell must be 4.
+-----------------+
~~~

### 2. Hidden Singles
A number must go somewhere! This occurs when a specific number is the *only* candidate for its value within a specific row, column, or 3x3 block, even if that cell contains other candidates.
~~~text
Example: Looking for where '7' can go in this 3x3 block:
+-----------+-----------+-----------+
| [ 1,2,3 ] | [ 1,5 ]   | [ 2,5 ]   |
+-----------+-----------+-----------+
| [ 3,8 ]   | [ 1,7,8 ] | [ 1,2 ]   | <- '7' only exists in the center cell!
+-----------+-----------+-----------+
| [ 2,3,4 ] | [ 1,2,4 ] | [ 3,4 ]   |
+-----------+-----------+-----------+
Action: The center cell automatically becomes 7.
~~~

### 3. Naked Pairs
A powerful elimination strategy. When two cells within the same group (row, column, or block) contain the **EXACT SAME TWO** candidates, those two numbers can be deleted from all other potential sets in that group.
~~~text
Example Row Possibilities:
[ 2,8 ] | [ 2,8 ] | [ 1,2,5,8 ] | [ 5,7,8 ]
  ^         ^
  Naked Pair! '2' and '8' are locked in these two cells.

Action: Erase '2' and '8' from the rest of the row.
[ 2,8 ] | [ 2,8 ] | [ 1, 5 ]    | [ 5, 7 ]
~~~

### 4. Pointing Pairs / Intersections
When a number's potential candidates are confined to a single row or column *only within a 3x3 block*, they "point" outward. All other candidates of that number can be safely eliminated from the rest of that entire row/column.
~~~text
Example Block Possibilities for the number '3':
+---------+---------+---------+       +---------+---------+
| [ 3,9 ] | [ 3,8 ] | [ 1,2 ] |   ->  | [ 1,3 ] | [ 3,5 ] | (Rest of the Row)
+---------+---------+---------+       +---------+---------+
| [ 4,5 ] | [ 7,8 ] | [ 1,9 ] |
+---------+---------+---------+
| [ 1,5 ] | [ 1,7 ] | [ 2,8 ] |
+---------+---------+---------+
  ^ The '3's in this block are aligned in the top row!

Action: Erase '3' from the rest of that row outside the block.
Result for the rest of the row ->     | [ 1 ]   | [ 5 ]   |
~~~

### 💡 Fallback Strategy: Visual Backtracking (Estimation)
If the logical rules run out of deductions, the system safely falls back to making an educated guess. It saves the exact state of the board, finds the cell with the fewest possibilities (usually a 50/50 chance), and branches the timeline.

~~~text
Situation: Logical deductions are exhausted.
Smallest remaining cell has two candidates (a 50/50 guess).

+-----------------+
| Possibilities:  |
| [ 4, 9 ]        | <- The AI splits the timeline here.
+-----------------+

 Timeline A: Guess '4'          Timeline B: Guess '9' (If 4 fails)
+-----------------+            +-----------------+
| Placed: 4       |            | Placed: 9       |
+-----------------+            +-----------------+
        |                              |
        v                              v
❌ Error: Conflict!            ✅ Solves the rest of the board!
(Rolls back time)
~~~

## 🚀 Getting Started

Because this is a pure client-side web application with no build steps or backend servers required, running it is incredibly simple:

1. Clone the repository:
   ~~~bash
   git clone https://github.com/zhengheetong/Sudoku-App.git
   ~~~
2. Navigate to the project folder.
3. Double-click on `index.html` to open it in your default web browser.

*(Note: For the OCR features to work, you need an active internet connection to pull the Tesseract.js language models via CDN).*

## 📖 How to Use

1. **Manual Entry**: Click any cell and type numbers (1-9).
2. **Scan Image**: 
   * Click **Scan Image (Auto-Fill)**.
   * Select a photo of a Sudoku grid.
   * Drag the crop corners to tightly box the 9x9 grid (avoiding outer borders).
   * Click **Initiate Scan** and wait for the Neural Net to decode the image. The original crop will be saved in the **Scan Reference** tab for your review.
3. **Solving & Replay**:
   * Click **Lock** to secure the starting numbers.
   * Click **Solve (Visualize)** to generate the solution. This will automatically open the **Terminal Replay** tab.
   * Hit **Auto-Play**, or manually drag the **Timeline Scrubber** slider to watch the AI's logic deductions step-by-step!
   * Alternately, click **Fast Solve** for an instant answer without the step-by-step breakdown.
4. **Reset**: Clears the board and closes the dashboard.

## 🧬 Origins & Credits

This project is a web-based evolution of my original **[C# WPF Sudoku Solver](https://github.com/zhengheetong/SudokuSolver)**. The core logic—including the possibility elimination algorithms (Naked Singles, Hidden Singles, Pairs) and the fallback backtracking estimation—was directly ported from the original C# architecture into Vanilla JavaScript.

* **Engineering & Logic:** Tong Zheng Hee
* **AI Co-Pilot:** Conversion from WPF/C# to a fully responsive, Cyberpunk-themed HTML/CSS/JS web application (including Tesseract.js, Cropper.js integration, and the Timeline Replay engine) was achieved with the assistance of **Google Gemini**.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is open source and available under the MIT License.
