# 🌆 Cyberpunk Sudoku Solver

A fully featured, client-side Sudoku Solver built with pure HTML, CSS, and Vanilla JavaScript. Wrapped in a sleek Cyberpunk aesthetic with Matrix digital rain, this app doesn't just solve Sudoku—it visualizes the logic, scans puzzles from images using Neural Networks (OCR), and provides a highly interactive user experience.

![Cyberpunk Sudoku Solver Preview](https://via.placeholder.com/800x450.png?text=Add+Screenshot+Here) *(Replace with an actual screenshot or GIF of your app)*

## ✨ Features

* 💻 **Cyberpunk Interface**: Neon glow effects, CSS glassmorphism, glitch text animations, and an animated Matrix digital rain background.
* 📷 **Image Scanning & Auto-Fill (OCR)**: Upload a picture of a Sudoku puzzle! The app uses **Cropper.js** to align the grid and **Tesseract.js** to extract the numbers and auto-fill the board.
* 🔎 **Scan Reference Panel**: After scanning, the cropped image stays pinned to the side so you can verify the OCR accuracy and make quick manual corrections if needed.
* 🧠 **Visual Deduction Engine**: Watch the AI solve the board exactly like a human would. It calculates and displays **possibilities** (the small red numbers) and applies logical algorithms step-by-step before resorting to backtracking.
* ⚡ **Cascading Fast Solve**: Solves the grid instantly in the background and reveals the answer with a satisfying top-left to bottom-right cascading animation.

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3, Vanilla JavaScript
* **Image Cropping**: [Cropper.js](https://github.com/fengyuanchen/cropperjs)
* **Optical Character Recognition**: [Tesseract.js](https://github.com/naptha/tesseract.js)
* **Fonts**: Google Fonts ('Inter' and standard Monospace)

## 🧮 How the AI Thinks (Algorithms)

Unlike simple solvers that just blindly guess numbers, this application features a persistent possibility state and applies real human Sudoku strategies:

1. **Naked Singles**: Places a number if it is the *only* possibility left for a specific cell.
2. **Hidden Singles**: Places a number if a specific row, column, or 3x3 block only has *one* valid cell left for that number.
3. **Naked Pairs**: If two cells in a group share the exact same two possibilities, those numbers are eliminated from the rest of the group.
4. **Pointing Pairs / Intersections**: If a possibility is confined to a single row or column inside a 3x3 block, it is eliminated from the rest of that row/column.
5. **Visual Backtracking**: If the logic rules run out of deductions, the system safely falls back to a visual guessing and backtracking algorithm to guarantee a solution.

## 🚀 Getting Started

Because this is a pure client-side web application with no build steps or backend servers required, running it is incredibly simple:

1. Clone the repository:
   ```bash
   git clone [https://github.com/zhengheetong/cyberpunk-sudoku-solver.git](https://github.com/zhengheetong/cyberpunk-sudoku-solver.git)
   ```
2. Navigate to the project folder.
3. Double-click on `index.html` to open it in your default web browser.

*(Note: For the OCR features to work, you need an active internet connection to pull the Tesseract.js language models via CDN).*

## 📖 How to Use

1. **Manual Entry**: Click any cell and type numbers (1-9).
2. **Scan Image**: 
   * Click **Scan Image (Auto-Fill)**.
   * Select a photo of a Sudoku grid.
   * Drag the crop corners to tightly box the 9x9 grid (avoiding outer borders).
   * Click **Initiate Scan** and wait for the Neural Net to decode the image.
3. **Solving**:
   * Click **Lock** to secure the starting numbers.
   * Click **Solve (Visualize)** to watch the logic engine work step-by-step.
   * Click **Fast Solve** for an instant answer.
4. **Reset**: Clears the board and starts fresh.

## 🧬 Origins & Credits

This project is a web-based evolution of my original **[C# WPF Sudoku Solver](https://github.com/zhengheetong/SudokuSolver)**. The core logic—including the possibility elimination algorithms (Naked Singles, Hidden Singles, Pairs) and the fallback backtracking estimation—was directly ported from the original C# architecture into Vanilla JavaScript.

* **Engineering & Logic:** Tong Zheng Hee
* **AI Co-Pilot:** Conversion from WPF/C# to a fully responsive, Cyberpunk-themed HTML/CSS/JS web application (including Tesseract.js and Cropper.js integration) was achieved with the assistance of **Google Gemini**.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is open source and available under the MIT License.
