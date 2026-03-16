import tkinter as tk
from tkinter import ttk
import pyautogui
import threading
import time
import keyboard

class ModernAutoClicker:
    def __init__(self, root):
        self.root = root
        self.root.title("UGA Pro Clicker")
        self.root.geometry("350x300")
        self.root.configure(bg="#2d2d2d")  # Dark theme
        
        self.clicking = False
        self.click_count = 0
        
        # Styles
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure("TLabel", foreground="white", background="#2d2d2d", font=("Segoe UI", 10))
        self.style.configure("TButton", font=("Segoe UI", 10, "bold"))

        # Header
        self.header = tk.Label(root, text="AUTOCLICKER", bg="#2d2d2d", fg="#00ffcc", font=("Segoe UI", 16, "bold"))
        self.header.pack(pady=15)

        # Status Indicator
        self.status_label = tk.Label(root, text="STATUS: READY", bg="#2d2d2d", fg="#aaaaaa", font=("Segoe UI", 9, "bold"))
        self.status_label.pack()

        # Counter
        self.count_label = tk.Label(root, text="Clicks: 0", bg="#2d2d2d", fg="white", font=("Segoe UI", 12))
        self.count_label.pack(pady=5)

        # Interval Slider
        tk.Label(root, text="Interval (Seconds)", bg="#2d2d2d", fg="white").pack()
        self.interval_slider = tk.Scale(root, from_=0.01, to=1.0, resolution=0.01, orient='horizontal', 
                                        bg="#2d2d2d", fg="white", highlightthickness=0, length=200)
        self.interval_slider.set(0.1)
        self.interval_slider.pack(pady=10)

        # Instructions
        self.instr = tk.Label(root, text="[F1] Start | [F2] Stop", bg="#2d2d2d", fg="#888888", font=("Segoe UI", 8))
        self.instr.pack(side="bottom", pady=10)

        # Register Global Hotkeys
        keyboard.add_hotkey('f1', self.start_clicking)
        keyboard.add_hotkey('f2', self.stop_clicking)

    def click_loop(self):
        while self.clicking:
            pyautogui.click()
            self.click_count += 1
            self.count_label.config(text=f"Clicks: {self.click_count}")
            time.sleep(self.interval_slider.get())

    def start_clicking(self):
        if not self.clicking:
            self.clicking = True
            self.status_label.config(text="STATUS: ACTIVE", fg="#00ffcc")
            threading.Thread(target=self.click_loop, daemon=True).start()

    def stop_clicking(self):
        self.clicking = False
        self.status_label.config(text="STATUS: STOPPED", fg="#ff4444")

if __name__ == "__main__":
    pyautogui.FAILSAFE = True
    root = tk.Tk()
    app = ModernAutoClicker(root)
    # Ensure hotkeys are released on close
    root.protocol("WM_DELETE_WINDOW", lambda: [keyboard.unhook_all(), root.destroy()])
    root.mainloop()